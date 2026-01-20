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
        const { mentorId, rating, comment, confidenceBefore, confidenceAfter, sessionId } = await req.json();

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

        const result = await prisma.$transaction(async (tx) => {
            const createFeedback = await tx.userFeedback.create({
                data: {
                    mentorId,
                    menteeId: userId,
                    sessionId,
                    rating,
                    comment,
                    confidenceBefore,
                    confidenceAfter,
                },
            });

            const mentorStats = await tx.user.findUnique({
                where: { 
                    id: mentorId 
                },
                select: { 
                    averageRating: true, 
                    ratingCount: true 
                },
            });

            const oldAvg = mentorStats?.averageRating ?? 0;
            const oldCount = mentorStats?.ratingCount ?? 0;

            const newCount = oldCount + 1;
            const newAvg = (oldAvg * oldCount + rating) / newCount;

            await tx.user.update({
                where: { 
                    id: mentorId 
                },
                data: {
                    averageRating: newAvg,
                    ratingCount: newCount,
                },
            });

            return createFeedback;
        });

        return Response.json({
            message: "Feedback submitted successfully",
            result
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

export async function GET(req: NextRequest,
    {
        params
    }: {
        params: { mentorId: string }
    }
) {
    const { mentorId } = params

    if (!mentorId) {
        return Response.json({
            message: "Mentor ID is required"
        }, {
            status: 400
        })
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get("limit")) || 10;
        const cursor = searchParams.get("cursor");
        let nextCursor: string | null = null

        const mentorExists = await prisma.user.findUnique({
            where: {
                id: mentorId
            },
            select: {
                id: true,
                averageRating: true,
                ratingCount: true
            }
        })

        if (!mentorExists) {
            return Response.json({
                message: "Mentor not found"
            }, {
                status: 404
            })
        }

        const fetchFeedback = await prisma.userFeedback.findMany({
            where: {
                mentorId: mentorId
            },
            select: {
                id: true,
                rating: true,
                comment: true,
                confidenceBefore: true,
                confidenceAfter: true,
                createdAt: true,
                mentee: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor
                },
            }),
            orderBy: {
                createdAt: "desc"
            }
        })

        if (fetchFeedback.length > limit) {
            const nextItem = fetchFeedback.pop()
            nextCursor = nextItem!.id
        }

        return Response.json({
            message: "Feedback fetched successfully",
            mentorExists: {
                id: mentorExists.id,
                averageRating: mentorExists.averageRating,
                ratingCount: mentorExists.ratingCount
            },
            fetchFeedback,
            pagination: {
                nextCursor
            }
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return Response.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}