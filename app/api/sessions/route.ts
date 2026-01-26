import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createSessionSchema } from "@/schema/sessionSchema";
import { z } from "zod";

export async function POST(req: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const mentorIdErrors = tree.properties?.mentorId?.errors || []
        const menteeIdErrors = tree.properties?.menteeId?.errors || []
        const skillIdErrors = tree.properties?.skillId?.errors || []
        const scheduleErrors = tree.properties?.scheduledAt?.errors || []
        const totalCallDurationErrors = tree.properties?.totalCallDuration?.errors || []
        const message = [
            ...mentorIdErrors,
            ...menteeIdErrors,
            ...skillIdErrors,
            ...scheduleErrors,
            ...totalCallDurationErrors
        ].join(", ") || "Invalid input"

        return NextResponse.json({
            message,
            errors: tree,
        }, {
            status: 400
        })
    }

    try {
        const { mentorId, menteeId, skillId, scheduledAt, totalCallDuration } = parsed.data

        if (mentorId === menteeId) {
            return NextResponse.json({
                message: "Mentor and mentee cannot be the same user"
            }, {
                status: 400
            })
        }

        if (menteeId !== userId) {
            return NextResponse.json({
                message: "Cannot create session for another user"
            }, {
                status: 400
            })
        }

        const mentorExists = await prisma.user.findUnique({
            where: {
                id: mentorId
            }
        })

        if (!mentorExists) {
            return NextResponse.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        const createSession = await prisma.session.create({
            data: {
                mentorId,
                menteeId,
                skillId,
                scheduledAt,
                totalCallDuration,
                status: "PENDING",
                roomId: crypto.randomUUID()
            }
        })

        return NextResponse.json({
            message: "Session created successfully",
            session: createSession
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating session:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}