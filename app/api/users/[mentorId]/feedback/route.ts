import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createFeedbackSchema } from "@/schema/createFeedbackSchema";
import { z } from "zod";
import { createNotification } from "@/lib/notification";

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const body = await req.json();

    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const commentError = tree.properties?.comment?.errors || []
        const ratingError = tree.properties?.rating?.errors || []
        const sessionIdError = tree.properties?.sessionId?.errors || []
        const confidenceAfterError = tree.properties?.confidenceAfter?.errors || []
        const confidenceBeforeError = tree.properties?.confidenceBefore?.errors || []
        const message = [...commentError, ...ratingError, ...sessionIdError, ...confidenceAfterError, ...confidenceBeforeError].join(", ") || "Invalid input"

        return NextResponse.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    try {
        const { mentorId } = body
        const { rating, comment, confidenceBefore, confidenceAfter, sessionId } = parsed.data

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        if (mentorId.toString() === userId.toString()) {
            return NextResponse.json({
                message: "You cannot give feedback to yourself"
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
            return NextResponse.json({
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
            return NextResponse.json(
                { message: "Invalid or incomplete session" },
                { status: 400 }
            )
        }

        const feedbackExists = await prisma.userFeedback.findUnique({
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
            return NextResponse.json({
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
                    comment: comment.trim(),
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

            await tx.notification.create({
                data: {
                    userId: mentorId,
                    senderId: userId,
                    type: "FEEDBACK_RECEIVED",
                    title: "New feedback received",
                    message: `${user.name} rated you ${rating} stars`
                }
            });

            return {
                feedback: createFeedback,
            };
        });

        return NextResponse.json({
            message: "Feedback submitted successfully",
            result
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({
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
        params: Promise<{ mentorId: string }>
    }
) {
    const { mentorId } = await params

    if (!mentorId) {
        return NextResponse.json({
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
            return NextResponse.json({
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

        return NextResponse.json({
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
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}