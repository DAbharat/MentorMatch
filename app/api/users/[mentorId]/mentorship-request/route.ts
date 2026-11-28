import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createMentorshipRequestSchema } from "@/schema/createMentorshipRequestSchema";
import { z } from "zod";
import { createNotification } from "@/lib/notification";
import { NotificationType, Prisma } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/auth";
import { invalidateRequestParticipants } from "@/redis/cache/mentorship-requests";

export async function POST(req: NextRequest,
    { params }: { params: Promise<{ mentorId: string }> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const resolvedParams = await params
    const { mentorId } = resolvedParams
    console.log("params", resolvedParams)

    if (!mentorId) {
        return NextResponse.json({
            message: "Invalid parameters"
        }, {
            status: 400
        })
    }

    const body = await req.json();
    const parsed = createMentorshipRequestSchema.safeParse(body);

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const initialMessageError = tree.properties?.initialMessage?.errors || []
        const skillIdError = tree.properties?.skillId?.errors || []
        const message = [...initialMessageError, ...skillIdError].join(", ") || "Invalid input"

        return NextResponse.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { initialMessage, skillId } = parsed.data;

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!userExists) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        if (mentorId === userId) {
            return NextResponse.json({
                message: "You cannot send a mentorship request to yourself"
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
                name: true
            }
        })

        if (!mentorExists) {
            return NextResponse.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        const skillExistsForMentor = await prisma.user.findFirst({
            where: {
                id: mentorId,
                skillsOffered: {
                    some: {
                        id: skillId
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        })

        if (!skillExistsForMentor) {
            return NextResponse.json({
                message: "Invalid skill selected"
            }, {
                status: 400
            })
        }

        const skill = await prisma.skill.findUnique({
            where: {
                id: skillId
            },
            select: {
                name: true
            }
        })

        const requestCreation = await prisma.$transaction(async (tx) => {
            const existingRequest = await tx.mentorshipRequest.findFirst({
                where: {
                    mentorId,
                    menteeId: userId,
                    skillId,
                    status: "PENDING"
                },
                select: {
                    id: true
                }
            })

            if (existingRequest) {
                return { duplicate: true as const }
            }

            const request = await tx.mentorshipRequest.create({
                data: {
                    mentorId,
                    menteeId: userId,
                    initialMessage,
                    skillId,
                    status: "PENDING",
                }
            })

            return { duplicate: false as const, request }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        })

        if (requestCreation.duplicate) {
            return NextResponse.json({
                message: "You already have a pending mentorship request for this skill with this mentor"
            }, {
                status: 409
            })
        }

        const createRequest = requestCreation.request

        console.log("Mentorship request created successfully:", createRequest.id)
        console.log("Now creating notification for mentor:", mentorId)

        await invalidateRequestParticipants(mentorId, userId)

        try {
            const sendNotificationToMentor = await createNotification({
                userId: mentorId,
                senderId: userId,
                type: NotificationType.MENTORSHIP_REQUEST_RECEIVED,
                title: "Received a mentorship request",
                message: `You received a mentorship request from ${userExists.name} for the skill ${skill?.name || 'Unknown'}`
            })
            console.log("Notification sent successfully:", sendNotificationToMentor.id)
        } catch (notificationError) {
            console.error("Failed to create notification but continuing:", notificationError)
        }

        return NextResponse.json({
            message: "Mentorship request sent successfully",
            requestId: createRequest.id
        }, {
            status: 201
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2034"
        ) {
            return NextResponse.json({
                message: "You already have a pending mentorship request for this skill with this mentor"
            }, {
                status: 409
            })
        }

        console.error("Error creating mentorship request:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}