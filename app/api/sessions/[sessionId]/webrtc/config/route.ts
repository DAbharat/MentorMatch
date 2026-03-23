import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { sessionId } = await params

    if (!sessionId) {
        return NextResponse.json({
            message: "Session ID is required"
        }, {
            status: 400
        })
    }

    try {

        const findSession = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                }
            }
        })

        if (!findSession) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }

        if (userId !== findSession?.mentor?.clerkUserId && userId !== findSession?.mentee?.clerkUserId) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const updateSession = await prisma.session.update({
            where: {
                id: sessionId
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                }
            },
            data: {
                callStartedAt: findSession.callStartedAt || new Date(),
                status: "IN_PROGRESS"
            }
        })

        if (!updateSession.callStartedAt) {
            return NextResponse.json({
                message: "Call has not started yet"
            }, {
                status: 400
            })
        }

        if (updateSession.callEndedAt) {
            return NextResponse.json({
                message: "Call already ended"
            }, {
                status: 400
            })
        }

        const now = new Date()
        const startTime = updateSession.callStartedAt
        const diff = now.getTime() - startTime.getTime()

        if (diff >= 30 * 60 * 1000) {
            return NextResponse.json(
                { message: "Session has exceeded allowed duration" },
                { status: 400 }
            )
        }

        const role = userId === updateSession.mentor?.clerkUserId ? "MENTOR" : "MENTEE"
        const roomId = `call_${sessionId}`

        const sessionExpiresAt = new Date(startTime.getTime() + 30 * 60 * 1000).toISOString()

        return NextResponse.json({
            role,
            roomId,
            sessionExpiresAt,
            iceServers: [
                { 
                    urls: "stun:stun.l.google.com:19302" 
                },
            ]
        })
    } catch (error) {
        console.error("Error fetching WebRTC config:", error)
        return NextResponse.json({
            message: "Failed to fetch WebRTC config"
        }, {
            status: 500
        })
    }
}