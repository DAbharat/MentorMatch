import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { cacheInvalidatePattern } from "@/lib/cache";

const CACHE_PREFIX = "cache:v1";

export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { chatId } = await params
    if (!chatId) {
        return NextResponse.json({
            message: "Chat ID is required"
        }, {
            status: 400
        })
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!userExists) {
            return NextResponse.json({
                message: "user not found"
            }, {
                status: 404
            })
        }

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            select: {
                mentorId: true,
                menteeId: true,
                skillId: true
            }
        })
        if (!chat) {
            return NextResponse.json({
                message: "Chat not found"
            }, {
                status: 404
            })
        }
        if (chat.mentorId !== userId && chat.menteeId !== userId) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const markAsRead = await prisma.message.updateMany({
            where: {
                chatId: chatId,
                isRead: false,
                senderId: {
                    not: userId
                }
            },
            data: {
                isRead: true,
                readAt: new Date()
            },
        })

        if (markAsRead.count > 0) {
            await cacheInvalidatePattern(`cache:v1:chat:list:${chat.mentorId}`)
            await cacheInvalidatePattern(`cache:v1:chat:list:${chat.menteeId}`)
            await cacheInvalidatePattern(`${CACHE_PREFIX}:chat:messages:${chatId}:*`)
        }

        return NextResponse.json({
            message: "Messages marked as read",
            markedAsReadCount: markAsRead.count
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error occurred while fetching chat:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}