import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createSessionSchema, SessionStatus, sessionStatusSchema, updateSessionSchema } from "@/schema/sessionSchema";
import { z } from "zod";

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
                id: sessionId || undefined
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

        const data: any = {
            status: rule.to
        }

        if (action === "START") {
            data.callStartedAt = new Date()
        }

        if (action === "COMPLETE") {
            const endedAt = new Date();
            data.callEndedAt = endedAt;
            data.totalCallDuration = getSession.callStartedAt
                ? Math.ceil(
                    (endedAt.getTime() -
                        getSession.callStartedAt.getTime()) /
                    60000
                )
                : null;
        }

        const updatedSession = await prisma.session.update({
            where: {
                id: sessionId
            },
            data
        })

        return NextResponse.json({
            message: `Session ${action.toLowerCase()} successfully`,
            data: updatedSession
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