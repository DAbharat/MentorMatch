import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest,
    { params }: { params: { mentorId: string; feedbackId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const { mentorId, feedbackId } = params

    if (!mentorId || !feedbackId) {
        return NextResponse.json(
            { message: "Invalid parameters" },
            { status: 400 }
        )
    }

    try {
        const feedback = await prisma.userFeedback.findFirst({
            where: {
                id: feedbackId,
                mentorId: mentorId
            }
        })

        if (!feedback) {
            return NextResponse.json({
                message: "Feedback not found"
            }, {
                status: 404
            })
        }

        if (feedback.menteeId !== userId) {
            return NextResponse.json({
                message: "You can only delete your own feedback"
            }, {
                status: 403
            })
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const deleteFeedback = await tx.userFeedback.delete({
                    where: {
                        id: feedbackId
                    }
                })

                const mentorStats = await tx.user.findUnique({
                    where: {
                        id: mentorId
                    },
                    select: {
                        averageRating: true,
                        ratingCount: true
                    }
                })

                if (!mentorStats) {
                    throw new Error("Mentor not found")
                }


                const deletedRating = feedback.rating

                const oldAvg = mentorStats?.averageRating ?? 0
                const oldCount = mentorStats?.ratingCount ?? 0

                let newAvg = 0
                let newCount = 0

                if (oldCount > 1) {
                    newCount = oldCount - 1
                    newAvg = (oldAvg * oldCount - deletedRating) / newCount
                }

                await tx.user.update({
                    where: {
                        id: params.mentorId
                    },
                    data: {
                        averageRating: newAvg,
                        ratingCount: newCount,
                    }
                })
            })

            return NextResponse.json({
                message: "Feedback deleted successfully",
                result
            }, {
                status: 200
            })

        } catch (error) {
            throw new Error("Error deleting feedback (transaction): " + error)
        }
    } catch (error) {
        console.error("Error fetching feedback:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}