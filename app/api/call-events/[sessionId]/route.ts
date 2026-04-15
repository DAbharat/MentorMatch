import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { callEventSchema } from "@/schema/callEventSchema";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest, 
{ params }: { params: Promise<{ sessionId : string }>} )  {

    const userId = getSessionFromRequest(req)
    if(!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const { sessionId } = await params

    const body = await req.json()
    const parsed = callEventSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const sessionIdError = tree.properties?.sessionId?.errors?.join(", ") || []
        const eventTypeError = tree.properties?.eventType?.errors?.join(", ") || []
        const message = [...sessionIdError, ...eventTypeError].join(", ") || "Invalid request body"

        return NextResponse.json({
            message
        }, {
            status: 400
        })
    }

    const { eventType } = parsed.data

    try {
        const getSession = await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })

        if(!getSession) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }

        const isMentor = userId === getSession.mentorId
        const isMentee = userId === getSession.menteeId

        if(!isMentor && !isMentee) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const createCallEvent = await prisma.callEvent.create({
            data: {
                sessionId,
                userId,
                eventType,
                timestamp: new Date()
            }
        })

        return NextResponse.json({
            message: "Call event created successfully",
            data: createCallEvent
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating call event:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}