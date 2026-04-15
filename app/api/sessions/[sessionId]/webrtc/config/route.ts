import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
    req: NextRequest,
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
    if (!sessionId) {
        return NextResponse.json({
            message: "Session ID is required"
        }, {
            status: 400
        })
    }

    try {
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                mentor: {
                    select: {
                        id: true, name: true
                    }
                },
                mentee: {
                    select: {
                        id: true, name: true
                    }
                }
            }
        })
        if (!session) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }
        if (userId !== session.mentor.id && userId !== session.mentee.id) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }
        if (session.status === "CANCELLED" || session.status === "COMPLETED") {
            return NextResponse.json({
                message: `Cannot join call - session is ${session.status.toLowerCase()}`
            }, {
                status: 400
            })
        }

        const role = userId === session.mentor.id ? "MENTOR" : "MENTEE"
        const roomId = `call_${sessionId}`

        const baseTime = session.callStartedAt || new Date()
        const sessionExpiresAt = new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString()

        return NextResponse.json({
            role,
            roomId,
            sessionExpiresAt,
            isCallActive: session.status === "IN_PROGRESS",
            iceServers: [
                { 
                    urls: "stun:stun.l.google.com:19302" 
                }
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

export async function POST(
    req: NextRequest,
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
    if (!sessionId) {
        return NextResponse.json({
            message: "Session ID is required"
        }, {
            status: 400
        })
    }

    try {
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                mentor: {
                    select: {
                        id: true
                    }
                },
                mentee: {
                    select: {
                        id: true
                    }
                }
            }
        })
        if (!session) {
            return NextResponse.json({
                message: "Session not found"
            }, {
                status: 404
            })
        }
        if (userId !== session.mentor.id && userId !== session.mentee.id) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }
        if (session.status === "IN_PROGRESS") {
            return NextResponse.json({
                message: "Call already in progress"
            }, {
                status: 400
            })
        }
        if (session.status === "COMPLETED" || session.status === "CANCELLED") {
            return NextResponse.json(
                { message: `Cannot start call - session is ${session.status.toLowerCase()}` },
                { status: 400 }
            )
        }
        if (session.callStartedAt) {
            const now = new Date()
            const startTime = session.callStartedAt
            const diff = now.getTime() - startTime.getTime()

            if (diff >= 30 * 60 * 1000) {
                return NextResponse.json({
                    message: "Session has exceeded maximum 30-minute duration"
                }, {
                    status: 400
                })
            }

            return NextResponse.json({
                message: "Call already started",
                callStartedAt: session.callStartedAt
            })
        }

        const now = new Date()
        const updatedSession = await prisma.session.update({
            where: {
                id: sessionId
            },
            data: {
                callStartedAt: now,
                status: "IN_PROGRESS"
            }
        })

        return NextResponse.json({
            message: "Call started successfully",
            callStartedAt: updatedSession.callStartedAt,
            sessionExpiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error starting WebRTC call:", error)
        return NextResponse.json({
            message: "Failed to start call"
        }, {
            status: 500
        })
    }
}