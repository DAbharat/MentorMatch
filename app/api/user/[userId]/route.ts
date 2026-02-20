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
                name: true,
                bio: true,
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

        if(!fetchUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            });
        }

        // Check if current user has accepted mentorship request with this profile user
        let hasAcceptedRequest = false;
        let chatId = null;

        if (currentClerkUserId && currentClerkUserId !== profileClerkUserId) {
            const currentUser = await prisma.user.findUnique({
                where: { clerkUserId: currentClerkUserId },
                select: { id: true }
            });

            if (currentUser) {
                // Check for accepted mentorship request (either direction)
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
                    
                    // Fetch the chat for this mentorship
                    const chat = await prisma.chat.findFirst({
                        where: {
                            OR: [
                                {
                                    mentorId: fetchUser.id,
                                    menteeId: currentUser.id,
                                    skillId: acceptedRequest.skillId
                                },
                                {
                                    mentorId: currentUser.id,
                                    menteeId: fetchUser.id,
                                    skillId: acceptedRequest.skillId
                                }
                            ]
                        },
                        select: {
                            id: true
                        }
                    });

                    chatId = chat?.id || null;
                }
            }
        }

        const options = {
            year: "numeric",
            month: "short"
        } as const

        const joinedAt = new Date(fetchUser.createdAt).toLocaleDateString("en-US", options);

        const data = {
            ...fetchUser,
            // skillsOffered: fetchUser.skillsOffered.map(s => s.name),
            // skillsWanted: fetchUser.skillsWanted.map(s => s.name),
            joinedAt,
            sessionsCompletedAsMentor: fetchUser._count.sessionsAsMentor,
            sessionsCompletedAsMentee: fetchUser._count.sessionsAsMentee,
            hasAcceptedRequest,
            chatId
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