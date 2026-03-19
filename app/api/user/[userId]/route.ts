import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { userId: currentClerkUserId } = await auth();
    const url = new URL(req.url);
    const profileClerkUserId = url.pathname.split("/").pop();

    if (!profileClerkUserId) {
        return NextResponse.json({
            message: "Bad Request: User ID is required in the URL"
        }, {
            status: 400
        });
    }

    try {
        const fetchUser = await prisma.user.findUnique({
            where: {
                clerkUserId: profileClerkUserId
            },
            select: {
                id: true,
                clerkUserId: true,
                name: true,
                bio: true,
                ratingCount: true,
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
                averageRating: true,
                _count: {
                    select: {
                        sessionsAsMentor: {
                            where: {
                                status: "COMPLETED"
                            }
                        },
                        sessionsAsMentee: {
                            where: {
                                status: "COMPLETED"
                            }
                        }
                    }
                },
                createdAt: true,
            }
        })

        if (!fetchUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            });
        }

        let hasAcceptedRequest = false;
        let chatId = null;
        let hasActiveConfirmedSession = false;

        if (currentClerkUserId && currentClerkUserId !== profileClerkUserId) {
            const currentUser = await prisma.user.findUnique({
                where: { clerkUserId: currentClerkUserId },
                select: { id: true }
            });

            if (currentUser) {
                const acceptedRequest = await prisma.mentorshipRequest.findFirst({
                    where: {
                        OR: [
                            {
                                mentorId: fetchUser.id,
                                menteeId: currentUser.id,
                                status: "ACCEPTED"
                            },
                            {
                                mentorId: currentUser.id,
                                menteeId: fetchUser.id,
                                status: "ACCEPTED"
                            }
                        ]
                    },
                    select: {
                        skillId: true
                    }
                });

                if (acceptedRequest) {
                    hasAcceptedRequest = true;

                    const fullRequest = await prisma.mentorshipRequest.findFirst({
                        where: {
                            OR: [
                                {
                                    mentorId: fetchUser.id,
                                    menteeId: currentUser.id,
                                    status: "ACCEPTED"
                                },
                                {
                                    mentorId: currentUser.id,
                                    menteeId: fetchUser.id,
                                    status: "ACCEPTED"
                                }
                            ]
                        },
                        select: {
                            mentorId: true,
                            menteeId: true,
                            skillId: true
                        }
                    });

                    if (fullRequest) {
                        const chat = await prisma.chat.upsert({
                            where: {
                                mentorId_menteeId_skillId: {
                                    mentorId: fullRequest.mentorId,
                                    menteeId: fullRequest.menteeId,
                                    skillId: fullRequest.skillId
                                }
                            },
                            update: {},
                            create: {
                                mentorId: fullRequest.mentorId,
                                menteeId: fullRequest.menteeId,
                                skillId: fullRequest.skillId
                            },
                            select: {
                                id: true
                            }
                        });

                        chatId = chat.id;

                        const confirmedSession = await prisma.session.findFirst({
                            where: {
                                OR: [
                                    {
                                        mentorId: fullRequest.mentorId,
                                        menteeId: fullRequest.menteeId,
                                    },
                                    {
                                        mentorId: fullRequest.menteeId,
                                        menteeId: fullRequest.mentorId,
                                    }
                                ],
                                skillId: fullRequest.skillId,
                                status: "CONFIRMED",
                                scheduledAt: {
                                    gte: new Date()
                                }
                            },
                            select: {
                                id: true,
                                scheduledAt: true
                            }
                        });

                        hasActiveConfirmedSession = !!confirmedSession;
                    }
                }
            }
        }

        const options = {
            year: "numeric",
            month: "short"
        } as const

        const joinedAt = new Date(fetchUser.createdAt).toLocaleDateString("en-US", options);

        const data = {
            id: fetchUser.id,
            clerkUserId: fetchUser.clerkUserId,
            name: fetchUser.name,
            bio: fetchUser.bio,
            createdAt: fetchUser.createdAt,
            joinedAt,

            stats: {
                averageRating: fetchUser.averageRating,
                ratingCount: fetchUser.ratingCount,
                sessionsCompletedAsMentor: fetchUser._count.sessionsAsMentor,
                sessionsCompletedAsMentee: fetchUser._count.sessionsAsMentee,
            },

            skillsOffered: fetchUser.skillsOffered,
            skillsWanted: fetchUser.skillsWanted,

            hasAcceptedRequest,
            chatId,
            hasActiveConfirmedSession
        }

        return NextResponse.json({
            message: "User fetched successfully",
            data
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}