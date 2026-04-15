import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createSessionSchema } from "@/schema/sessionSchema";
import { z } from "zod";
import { createNotification } from "@/lib/notification";
import { NotificationType } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
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

        const sessions = await prisma.session.findMany({
            where: {
                OR: [
                    { 
                        mentorId: userId 
                    },
                    { 
                        menteeId: userId 
                    }
                ]
            },
            select: {
                id: true,
                mentorshipRequestId: true,
                mentorId: true,
                menteeId: true,
                skillId: true,
                scheduledAt: true,
                status: true,
                callStartedAt: true,
                totalCallDuration: true,
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
                },
                skill: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                feedback: true
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        })

        return NextResponse.json({
            message: "Sessions fetched successfully",
            sessions
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching sessions:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

export async function POST(req: NextRequest) {

    const userId = getSessionFromRequest(req)
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
        const mentorshipRequestIdErrors = tree.properties?.mentorshipRequestId?.errors || []
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
        const { mentorId, menteeId, skillId, mentorshipRequestId, scheduledAt, totalCallDuration } = parsed.data

        if (mentorId === menteeId) {
            return NextResponse.json({
                message: "Mentor and mentee cannot be the same user"
            }, {
                status: 400
            })
        }

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
            },
            select: {
                id: true,
                name: true,
                skillsOffered: {
                    select: {
                        id: true,
                        name: true
                    }
                }
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
                mentorshipRequestId,
                scheduledAt,
                totalCallDuration,
                status: "PENDING",
                roomId: crypto.randomUUID()
            }
        })

        const sendNotificationToMentor = await createNotification({
            userId: mentorId,
            senderId: userId,
            type: NotificationType.SESSION_SCHEDULED,
            title: `New Session request`,
            message: `${userExists.name} requested session for the skill ${mentorExists.skillsOffered.find(s => s.id === skillId)?.name || "Unknown Skill"} scheduled at ${new Date(scheduledAt).toLocaleString()}`
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