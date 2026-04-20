import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { buildCacheKey, cacheGet, cacheInvalidatePattern, cacheSet } from "@/lib/cache";

const CACHE_PREFIX = "cache:v1"

async function getDynamicFields(
    viewerId: string | null,
    profileUserId: string
) {
    let hasAcceptedRequest = false;
    let chatId = null;
    let hasActiveConfirmedSession = false;

    if (viewerId && viewerId !== profileUserId) {
        const acceptedRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                OR: [
                    {
                        mentorId: profileUserId,
                        menteeId: viewerId,
                        status: "ACCEPTED"
                    },
                    {
                        mentorId: viewerId,
                        menteeId: profileUserId,
                        status: "ACCEPTED"
                    }
                ]
            },
            select: {
                mentorId: true,
                menteeId: true,
                skillId: true
            }
        })

        if (acceptedRequest) {
            hasAcceptedRequest = true;

            const chat = await prisma.chat.upsert({
                where: {
                    mentorId_menteeId_skillId: {
                        mentorId: acceptedRequest.mentorId,
                        menteeId: acceptedRequest.menteeId,
                        skillId: acceptedRequest.skillId
                    }
                },
                update: {},
                create: {
                    mentorId: acceptedRequest.mentorId,
                    menteeId: acceptedRequest.menteeId,
                    skillId: acceptedRequest.skillId
                },
                select: {
                    id: true
                }
            })
            await cacheInvalidatePattern(`${CACHE_PREFIX}:chat:list:${acceptedRequest.mentorId}`)
            await cacheInvalidatePattern(`${CACHE_PREFIX}:chat:list:${acceptedRequest.menteeId}`)

            chatId = chat.id

            const confirmedSession = await prisma.session.findFirst({
                where: {
                    OR: [
                        {
                            mentorId: acceptedRequest.mentorId,
                            menteeId: acceptedRequest.menteeId
                        },
                        {
                            mentorId: acceptedRequest.menteeId,
                            menteeId: acceptedRequest.mentorId
                        }
                    ],
                    skillId: acceptedRequest.skillId,
                    status: "CONFIRMED",
                    scheduledAt: {
                        gte: new Date()
                    }
                },
                select: {
                    id: true
                }
            })

            hasActiveConfirmedSession = !!confirmedSession
        }
    }

    return {
        hasAcceptedRequest,
        chatId,
        hasActiveConfirmedSession
    }
}

export async function GET(req: NextRequest) {
    const userId = getSessionFromRequest(req)
    const url = new URL(req.url);
    const profileUserId = url.pathname.split("/").pop();

    if (!profileUserId) {
        return NextResponse.json({
            message: "Bad Request: User ID is required in the URL"
        }, {
            status: 400
        });
    }

    const cacheKey = buildCacheKey("user", "profile", profileUserId)

    try {
        const cached = await cacheGet<any>(cacheKey)
        if (cached) {
            const dynamic = await getDynamicFields(userId, profileUserId)

            return NextResponse.json({
                message: "User fetched successfully (cached)",
                data: {
                    ...cached,
                    ...dynamic
                }
            }, {
                status: 200
            })
        }

        const fetchUser = await prisma.user.findUnique({
            where: {
                id: profileUserId
            },
            select: {
                id: true,
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

        const dynamic = await getDynamicFields(userId, profileUserId)

        const joinedAt = new Date(fetchUser.createdAt).toLocaleDateString("en-US");

        const baseProfile = {
            id: fetchUser.id,
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
        }

        await cacheSet(cacheKey, baseProfile)

        const data = {
            ...baseProfile,
            ...dynamic
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