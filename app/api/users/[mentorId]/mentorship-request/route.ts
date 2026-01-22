import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createMentorshipRequestSchema } from "@/schema/createMentorshipRequestSchema";
import z from "zod";

export async function POST(req: NextRequest,
    { params }: { params: { mentorId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { mentorId } = params

    if (!mentorId) {
        return Response.json({
            message: "Invalid parameters"
        }, {
            status: 400
        })
    }

    if (mentorId === userId) {
        return Response.json({
            message: "You cannot send a mentorship request to yourself"
        }, {
            status: 400
        })
    }

    const body = await req.json();
    const parsed = createMentorshipRequestSchema.safeParse(body);

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const initialMessageError = tree.properties?.initialMessage?.errors || []
        const message = [...initialMessageError].join(", ") || "Invalid input"

        return Response.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { initialMessage } = parsed.data;

    try {
        const mentorExists = await prisma.user.findUnique({
            where: {
                id: mentorId
            },
            select: {
                id: true
            }
        })

        if (!mentorExists) {
            return Response.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        const mentorshipRequestExists = await prisma.mentorshipRequest.findUnique({
            where: {
                mentorId_menteeId: {
                    mentorId: mentorId,
                    menteeId: userId
                }
            }
        })

        if (mentorshipRequestExists?.status === "PENDING") {
            return Response.json({
                message: "You have already sent a mentorship request to this mentor"
            }, {
                status: 400
            })
        }

        if (mentorshipRequestExists?.status === "ACCEPTED") {
            return Response.json({
                message: "You are already mentored by this mentor"
            }, {
                status: 400
            })
        }

        if (mentorshipRequestExists?.status === "REJECTED") {
            return Response.json({
                message: "Your previous mentorship request was rejected"
            }, {
                status: 400
            })
        }

        const createRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId: mentorId,
                menteeId: userId,
                initialMessage: initialMessage,
                status: "PENDING",
            }
        })

        return Response.json({
            message: "Mentorship request sent successfully",
            requestId: createRequest.id
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating mentorship request:", error)
        return Response.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}