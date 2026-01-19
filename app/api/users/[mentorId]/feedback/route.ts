import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return Response.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            return Response.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const { mentorId, rating, comment, confidenceBefore, confidenceAfter, sessionId } = await req.json();

        const mentorExists = await prisma.user.findUnique({
            where: {
                id: mentorId
            }
        })

        if (!mentorExists) {
            return Response.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        if (mentorId.toString() === userId.toString()) {
            return Response.json({
                message: "You cannot give feedback to yourself"
            }, {
                status: 400
            })
        }

        if (rating < 1 || rating > 5) {
            return Response.json({
                message: "Rating must be between 1 and 5"
            }, {
                status: 400
            })
        }

        const sessionExists = await prisma.session.findFirst({
            where: {
                id: sessionId,
                mentorId,
                menteeId: userId,
                status: "COMPLETED",
            },
        })

        if (!sessionExists) {
            return Response.json(
                { message: "Invalid or incomplete session" },
                { status: 400 }
            )
        }

        const feedbackExists = await prisma.userFeedback.findFirst({
            where: {
                mentorId: mentorId,
                menteeId: userId,
                session: {
                    status: "COMPLETED"
                },
                sessionId: sessionId
            }
        })

        if (feedbackExists) {
            return Response.json({
                message: "Feedback already submitted for this session"
            }, {
                status: 400
            })
        }

        const createFeedback = await prisma.userFeedback.create({
            data: {
                mentorId: mentorId,
                menteeId: userId,
                rating: rating,
                comment: comment,
            }
        })

        return Response.json({
            message: "Feedback submitted successfully",
            feedback: createFeedback
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return Response.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}