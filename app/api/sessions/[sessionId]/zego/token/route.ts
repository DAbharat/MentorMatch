import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateZegoToken } from "@/lib/zego";


const APP_ID = Number(process.env.ZEGOCLOUD_APP_ID)

if(!APP_ID) {
  throw new Error("ZEGOCLOUD_APP_ID is not defined in environment variables")
}

export async function POST(req: NextRequest,
    { params } : { params : { sessionId : string}}
) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { sessionId } = params

    if(!sessionId) {
        return NextResponse.json({
            message: "Session ID is required"
        }, {
            status: 400
        })
    }

    try {
        const sessionExists = await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })

        if(!sessionExists) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }

        const isMentor = userId === sessionExists.mentorId
        const isMentee = userId === sessionExists.menteeId

        if(!isMentor && !isMentee) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        if(["COMPLETED", "CANCELLED"].includes(sessionExists.status)) {
            return NextResponse.json({
                message: `Cannot generate token for a ${sessionExists.status.toLowerCase()} session`
            }, {
                status: 400
            })
        }

        const roomId = `session_${sessionExists.id}`

        const token = generateZegoToken({
            userId: userId,
            roomId: roomId,
            expireSeconds: 3600
        })

        return NextResponse.json({
            appId: APP_ID,
            token: token,
            roomId: roomId,
            userId: userId,
            message: "Zego token generated successfully"
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error generating Zego token:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}