import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { buildCacheKey, cacheGet, cacheSet } from "@/lib/cache";

const CACHE_PREFIX = "cache:v1"

export async function GET(req: NextRequest) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const url = new URL(req.url)
    const searchChatByName = url.searchParams.get("name")?.trim()

    const cacheKey = `${CACHE_PREFIX}:chat:list:${userId}:${searchChatByName || "all"}`

    try {
        const cached = await cacheGet<any>(cacheKey)
        if (cached) {
            return NextResponse.json(
                cached,
                {
                    status: 200
                })
        }

        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!userExists) {
            return NextResponse.json({
                message: "user not found."
            }, {
                status: 404
            })
        }

        const whereClause: any = {
            OR: [
                {
                    mentorId: userId
                },
                {
                    menteeId: userId
                }
            ]
        };

        if (searchChatByName) {
            if (searchChatByName.length < 1 || searchChatByName.length > 50) {
                return NextResponse.json({
                    message: "Chat name must be between 1 and 50 characters"
                }, {
                    status: 400
                })
            }

            whereClause.AND = [
                {
                    OR: [
                        {
                            mentor: {
                                name: {
                                    contains: searchChatByName,
                                    mode: "insensitive"
                                }
                            }
                        },
                        {
                            mentee: {
                                name: {
                                    contains: searchChatByName,
                                    mode: "insensitive"
                                }
                            }
                        },
                        {
                            skill: {
                                name: {
                                    contains: searchChatByName,
                                    mode: "insensitive"
                                }
                            }
                        }
                    ]
                }
            ];
        }

        const fetchChatsForAUser = await prisma.chat.findMany({
            where: whereClause,
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                skill: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        senderId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: {
                                    not: userId
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const unreadChatsCount = fetchChatsForAUser.filter((chat: {
            _count: {
                messages: number
            }
        }) => chat._count.messages > 0).length

        const response = {
            chats: fetchChatsForAUser,
            unreadCount: unreadChatsCount
        }

        await cacheSet(cacheKey, response, 300)
        return NextResponse.json(
            response,
        {
            status: 200
        })

    } catch (error) {
        console.error("Error fetching chats for user:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}