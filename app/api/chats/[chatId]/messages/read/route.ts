import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { userId } = await auth()

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
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            },
            select: {
                id: true,
                name: true,
                clerkUserId: true
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

        if (chat.mentorId !== dbUserId && chat.menteeId !== dbUserId) {
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
                    not: dbUserId
                }
            },
            data: {
                isRead: true,
                readAt: new Date()
            },
        })

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