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

        const fetchChatsForAUser = await prisma.chat.findMany({
            where: {
                OR: [
                    {
                        mentorId: dbUserId
                    },
                    {
                        menteeId: dbUserId
                    }
                ]
            },
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
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({
            message: "Chats fetched successfully",
            chats: fetchChatsForAUser
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