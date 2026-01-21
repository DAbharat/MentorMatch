import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest,
    { params }: { params: { requestId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { requestId } = params

    if (!requestId) {
        return Response.json({
            message: "Request ID is required"
        }, {
            status: 400
        })
    }

    try {
        const { status } = await req.json()

        if (!["ACCEPT", "REJECT"].includes(status)) {
            return Response.json({
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
            return Response.json({
                message: "Mentorship request not found"
            }, {
                status: 404
            })
        }

        if (mentorshipRequestExists.mentorId !== userId) {
            return Response.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        if (mentorshipRequestExists.status !== "PENDING") {
            return Response.json({
                message: "Mentorship request already processed"
            }, {
                status: 400
            })
        }

        const newStatus =
            status === "ACCEPT" ? "ACCEPTED" : "REJECTED"

        const updateRequest = await prisma.mentorshipRequest.update({
            where: {
                id: requestId
            },
            data: {
                status: newStatus
            }
        })

        return Response.json({
            message: "Mentorship request updated successfully",
            data: updateRequest
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error updating mentorship request:", error)
        return Response.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}