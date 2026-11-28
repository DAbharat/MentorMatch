import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SessionStatus, updateSessionSchema } from "@/schema/sessionSchema";
import { z } from "zod";
import { computeSessionMetrices } from "@/lib/helpers/session-metrics";
import { createNotification } from "@/lib/notification";
import { NotificationType, Prisma } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/auth";
import { invalidateSessionParticipants } from "@/redis/cache/sessions";
import { invalidateMentorAnalytics } from "@/redis/cache/analytics";
import { cancelSessionReminder, scheduleSessionReminder } from "@/queues/sqs.producer";

type TransitionRule = {
    from: SessionStatus[];
    to: SessionStatus;
    role: "MENTOR" | "ANY";
};

const SESSION_TRANSITIONS: Record<string, TransitionRule> = {
    CONFIRM: {
        from: ["PENDING"],
        to: "CONFIRMED",
        role: "MENTOR"
    },
    START: {
        from: ["CONFIRMED"],
        to: "IN_PROGRESS",
        role: "MENTOR"
    },
    COMPLETE: {
        from: ["IN_PROGRESS"],
        to: "COMPLETED",
        role: "MENTOR"
    },
    CANCEL: {
        from: ["PENDING", "CONFIRMED"],
        to: "CANCELLED",
        role: "ANY"
    }
} as const;

type ActionHandler = (
    session: Prisma.SessionGetPayload<{
        include: {
            mentor: true
            mentee: true
            skill: true
        }
    }>,
    sessionId: string,
    isAutoEnd?: boolean
) => Promise<Prisma.SessionUpdateManyMutationInput>

const ACTION_HANDLERS: Record<string, ActionHandler> = {
    CONFIRM: async() => {
        return {
            status: "CONFIRMED"
        }
    },

    START: async(session) => {
        if(session.callStartedAt) {
            throw new Error("Session has already been started")
        }

        return {
            status: "IN_PROGRESS",
            callStartedAt: new Date()
        }
    },

    COMPLETE: async(session, sessionId, isAutoEnd) => {
        if(session.metricsComputedAt) {
            throw new Error("Session metrics already finalized")
        }

        const metrics = await computeSessionMetrices(sessionId)
        if(!metrics || metrics.totalActiveMinutes < 10) {
            throw new Error("Session cannot be completed manually before 10 minutes of active participation")
        }

        return {
            status: "COMPLETED",
            callEndedAt: new Date(),
            totalCallDuration: metrics.totalActiveMinutes,
            mentorActiveMinutes: metrics.mentorActiveMinutes,
            menteeActiveMinutes: metrics.menteeActiveMinutes,
            metricsComputedAt: new Date(),
            completedBy: isAutoEnd ? "Auto" : "Mentor"
        }
    },

    CANCEL: async(session) => {
        if(session.callStartedAt) {
    
            throw new Error("Cannot cancel a started session")
        }

        return {
            status: "CANCELLED"
        }
    }
}


export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { sessionId } = await params
    const body = await req.json()

    const parsedUpdateStatus = updateSessionSchema.safeParse(body);
    if (!parsedUpdateStatus.success) {
        const tree = z.treeifyError(parsedUpdateStatus.error)
        const updateStatusErrors = tree.properties?.action?.errors || []
        const message = [...updateStatusErrors].join(", ") || "Invalid status"

        return NextResponse.json({
            message,
            errors: tree,
        }, {
            status: 400
        })
    }

    try {
        const { action, isAutoEnd } = parsedUpdateStatus.data
        const rule = SESSION_TRANSITIONS[action as keyof typeof SESSION_TRANSITIONS]

        const getSession = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                mentor: true,
                mentee: true,
                skill: true
            }
        })
        console.log("getsession", getSession)

        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const isMentor = userId === getSession?.mentorId
        const isMentee = userId === getSession?.menteeId

        if (!getSession) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }

        if (!isMentor && !isMentee) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        if (!isAutoEnd && rule.role === "MENTOR" && !isMentor) {
            return NextResponse.json({
                message: "Only mentor can perform this action"
            }, {
                status: 403
            })
        }

        if (!rule.from.includes(getSession.status)) {
            return NextResponse.json({
                message: `Cannot transition from ${getSession.status} using action ${action}`
            }, {
                status: 400
            })
        }

        const actionHandler = ACTION_HANDLERS[action]

        if(!actionHandler) {
            return NextResponse.json({
                message: "Invalid action"
            }, {
                status: 400
            })
        }

        let data: Prisma.SessionUpdateManyMutationInput;

        try {
            data = await actionHandler(getSession, sessionId, isAutoEnd);
        } catch (error: unknown) {
            return NextResponse.json({
                message: error instanceof Error ? error.message : "Action handler error"
            }, {
                status: 400
            })
        }

        const updateResult = await prisma.session.updateMany({
            where: {
                id: sessionId,
                status: {
                    in: rule.from
                }
            },
            data
        })

        if (updateResult.count === 0) {
            return NextResponse.json({
                message: "This session was already updated. Refresh to see its current status."
            }, {
                status: 409
            })
        }

        const updateSession = await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })

        if (!updateSession) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }
        if(action === "CONFIRM") {
            await scheduleSessionReminder(updateSession.id, updateSession.scheduledAt)
        } else if(action === "CANCEL") {
            await cancelSessionReminder(sessionId)
        }

        const sendNotification = await createNotification({
            userId: isMentor ? getSession.menteeId : getSession.mentorId,
            senderId: userId,
            type: action === "CONFIRM" ? NotificationType.SESSION_CONFIRMED :
                action === "START" ? NotificationType.SESSION_STARTED :
                NotificationType.SESSION_CANCELLED,
            title: `Session ${action === "CONFIRM" ? "confirmed" : action === "START" ? "started" : "cancelled"}`,
            message: `Your session for the skill ${getSession.skill.name} scheduled at ${new Date(getSession.scheduledAt).toLocaleString()} has been ${action === "CONFIRM" ? "confirmed" : action === "START" ? "started" : "cancelled"} by the ${isMentor ? "mentor" : "mentee"}`
        })
        await invalidateSessionParticipants(getSession.mentorId, getSession.menteeId)
        await invalidateMentorAnalytics(getSession.mentorId)

        return NextResponse.json({
            message: `Session ${action} successful`,
            session: updateSession
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Session PATCH error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest,
    { params } : { params: Promise<{sessionId : string}> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { sessionId } = await params

    try {
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        if(!session) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }

        if(userId !== session?.mentor?.id && userId !== session?.mentee?.id) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        return NextResponse.json({
            message: "Session fetched successfully",
            session
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Session GET error:", error);
        return NextResponse.json({ 
            message: "Internal server error" 
        },{ 
            status: 500 
        });
    }
}