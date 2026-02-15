import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createSessionSchema, SessionStatus, sessionStatusSchema, updateSessionSchema } from "@/schema/sessionSchema";
import { z } from "zod";
import { computeSessionMetrices } from "@/lib/session-metrics";
import { stat } from "fs";
import { createNotification } from "@/lib/notification";
import { NotificationType } from "@prisma/client";

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
    session: any,
    userId: string,
    sessionId: string,
) => Promise<Record<string, any>>

const ACTION_HANDLERS: Record<string, ActionHandler> = {
    CONFIRM: async() => {
        return {
            status: "CONFIRMED"
        }
    },

    START: async(session, _userId, _sessionId) => {
        if(session.callStartedAt) {
            throw new Error("Session has already been started")
        }

        return {
            status: "IN_PROGRESS",
            callStartedAt: new Date()
        }
    },

    COMPLETE: async(session, _userId, sessionId) => {
        if(session.metricsComputedAt) {
            throw new Error("Session metrics already finalized")
        }

        const metrics = await computeSessionMetrices(sessionId)
        if(!metrics || metrics.totalActiveMinutes < 15) {
            throw new Error("Session cannot be completed manually before 15 minutes of active participation")
        }

        return {
            status: "COMPLETED",
            callEndedAt: new Date(),
            totalCallDuration: metrics.totalActiveMinutes,
            mentorActiveMinutes: metrics.mentorActiveMinutes,
            menteeActiveMinutes: metrics.menteeActiveMinutes,
            metricsComputedAt: new Date(),
            completedBy: "Mentor"
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
    { params }: { params: { sessionId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { sessionId } = params
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
        const { action } = parsedUpdateStatus.data
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

        if (rule.role === "MENTOR" && !isMentor) {
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

        let data;

        try {
            data = await actionHandler(getSession, userId, sessionId);
        } catch (error: any) {
            return NextResponse.json({
                message: error.message || "Action handler error"
            }, {
                status: 400
            })
        }

        const updateSession = await prisma.session.update({
            where: {
                id: sessionId
            },
            data
        })

        const sendNotification = await createNotification({
            userId: isMentor ? getSession.menteeId : getSession.mentorId,
            type: action === "CONFIRM" ? NotificationType.SESSION_CONFIRMED :
                action === "START" ? NotificationType.SESSION_STARTED :
                NotificationType.SESSION_CANCELLED,
            title: `Session ${action === "CONFIRM" ? "confirmed" : action === "START" ? "started" : "cancelled"}`,
            message: `Your session for the skill ${getSession.skill.name} scheduled at ${new Date(getSession.scheduledAt).toLocaleString()} has been ${action === "CONFIRM" ? "confirmed" : action === "START" ? "started" : "cancelled"} by the ${isMentor ? "mentor" : "mentee"}`
        })

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