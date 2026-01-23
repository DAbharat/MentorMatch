import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { request } from "node:http";
import { updateMentorshipRequestStatusSchema } from "@/schema/createMentorshipRequestSchema";
import { z } from "zod";

export async function PATCH(req: NextRequest,
    { params }: { params: { requestId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { requestId } = params

    if (!requestId) {
        return NextResponse.json({
            message: "Request ID is required"
        }, {
            status: 400
        })
    }

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

        const mentorshipRequestExists = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            }
        })

        if (!mentorshipRequestExists) {
            return NextResponse.json({
                message: "Mentorship request not found"
            }, {
                status: 404
            })
        }

        if (mentorshipRequestExists.mentorId !== userId) {
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

        const result = await prisma.$transaction(async (tx) => {
            const updateRequest = await tx.mentorshipRequest.update({
                where: {
                    id: requestId
                },
                data: {
                    status: newStatus
                }
            })

            let chat = null

            if (newStatus === "ACCEPTED") {
                chat = await tx.chat.upsert({
                    where: {
                        mentorId_menteeId: {
                            mentorId: updateRequest.mentorId,
                            menteeId: updateRequest.menteeId
                        }
                    },
                    update: {},
                    create: {
                        mentorId: updateRequest.mentorId,
                        menteeId: updateRequest.menteeId
                    }
                })
            }
            return {
                updateRequest,
                chat
            }
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