import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const url = new URL(req.url)
    const searchChatByName = url.searchParams.get("name")?.trim()

    try {
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            },
            select: {
                id: true,
                name: true,
            }
        })

        if (!dbUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const dbUserId = dbUser.id

        const whereClause: any = {
            OR: [
                {
                    mentorId: dbUserId
                },
                {
                    menteeId: dbUserId
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
                        clerkUserId: true
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
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
                                clerkUserId: true
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
                                    not: dbUserId
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

        return NextResponse.json({
            message: "Chats fetched successfully",
            chats: fetchChatsForAUser,
            unreadCount: unreadChatsCount
        }, {
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