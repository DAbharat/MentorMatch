import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { request } from "node:http";
import { updateMentorshipRequestStatusSchema } from "@/schema/createMentorshipRequestSchema";
import { z } from "zod";
import { createNotification } from "@/lib/notification";
import { NotificationType } from "@prisma/client";

export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { requestId } = await params

    const body = await req.json()
    const parsed = updateMentorshipRequestStatusSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const statusError = tree.properties?.status?.errors || []
        const message = [...statusError].join(", ") || "Invalid input"

        return NextResponse.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    try {
        const { status: action } = parsed.data

        if (!["ACCEPT", "REJECT"].includes(action)) {
            return NextResponse.json({
                message: "Invalid status"
            }, {
                status: 400
            })
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!dbUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const dbUserId = dbUser.id

        const mentorshipRequestExists = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            },
            include: {
                skill: true
            }
        })

        if (!mentorshipRequestExists) {
            return NextResponse.json({
                message: "Mentorship request not found"
            }, {
                status: 404
            })
        }

        if (mentorshipRequestExists.mentorId !== dbUserId) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        if (mentorshipRequestExists.status !== "PENDING") {
            return NextResponse.json({
                message: "Mentorship request already processed"
            }, {
                status: 400
            })
        }

        const newStatus =
            action === "ACCEPT" ? "ACCEPTED" : "REJECTED"

        console.log("Starting transaction...")
        console.log("Request ID:", requestId)
        console.log("New Status:", newStatus)

        const result = await prisma.$transaction(async (tx) => {
            console.log("Updating mentorship request...")
            const updateRequest = await tx.mentorshipRequest.update({
                where: {
                    id: requestId
                },
                data: {
                    status: newStatus
                }
            })

            console.log("Request updated:", updateRequest)

            let chat = null

            if (newStatus === "ACCEPTED") {
                console.log("Creating/updating chat...")
                console.log("mentor:", updateRequest.mentorId)
                console.log("mentee:", updateRequest.menteeId)
                console.log("skill:", updateRequest.skillId)
                
                chat = await tx.chat.upsert({
                    where: {
                        mentorId_menteeId_skillId: {
                            mentorId: updateRequest.mentorId,
                            menteeId: updateRequest.menteeId,
                            skillId: updateRequest.skillId
                        }
                    },
                    update: {},
                    create: {
                        mentorId: updateRequest.mentorId,
                        menteeId: updateRequest.menteeId,
                        skillId: updateRequest.skillId
                    }
                })
                console.log("Chat created/updated:", chat)
            }
            return {
                updateRequest,
                chat
            }
        })

        console.log("Transaction completed successfully")

        const sendNotificationToMentee = await createNotification({
            userId: mentorshipRequestExists.menteeId,
            senderId: dbUserId,
            mentorshipRequestId: requestId,
            type: action === "ACCEPT" ? NotificationType.MENTORSHIP_REQUEST_ACCEPTED : NotificationType.MENTORSHIP_REQUEST_REJECTED,
            title: action === "ACCEPT" ? "Your mentorship request was accepted" : "Your mentorship request was rejected",
            message: `Your mentorship request for the skill ${mentorshipRequestExists.skill.name} was ${action === "ACCEPT" ? "accepted" : "rejected"} by ${dbUser.name}`
        })

        return NextResponse.json({
            message: "Mentorship request updated successfully",
            request: result.updateRequest,
            chatId: result.chat?.id || null
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error updating mentorship request:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

export async function GET(req: NextRequest,
    { params } : { params : Promise<{ requestId : string }> }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { requestId } = await params

    try {

        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!dbUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const dbUserId = dbUser?.id

        const mentorshipRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                id: requestId,
                OR: [
                    {
                        mentorId: dbUserId
                    },
                    {
                        menteeId: dbUserId
                    }
                ]
            },
            include: {
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        skillsOffered: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        skillsWanted: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        clerkUserId: true,
                        createdAt: true,
                    }
                },
                skill: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            }
        })
        console.log("request: ", mentorshipRequest)

        if (!mentorshipRequest) {
            return NextResponse.json({
                message: "Mentorship request not found"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            message: "Mentorship request fetched successfully",
            data: mentorshipRequest
        }, {
            status: 200
        })
        
    } catch (error) {
        console.error("Error fetching mentorship request:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}