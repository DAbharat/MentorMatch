import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sendMessageSchema } from "@/schema/messageSchema";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { chatId } = await context.params
    if (!chatId) {
        return NextResponse.json({
            message: "Chat ID is required"
        }, {
            status: 400
        })
    }

    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const contentErrors = tree.properties?.content?.errors || []
        const message = contentErrors.join(", ") || "Invalid request body"

        return NextResponse.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    try {
        const { content } = parsed.data
        //console.log("content: ", content)
        
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "user not found."
            }, {
                status: 404
            })
        }
        
        const chatExists = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
            select: {
                id: true,
                mentorId: true,
                menteeId: true,
                skillId: true
            }
        })

        if (!chatExists) {
            return NextResponse.json({
                message: "Chat not found"
            }, {
                status: 404
            })
        }

        if (userId !== chatExists.mentorId && userId !== chatExists.menteeId) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const mentorShipRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                mentorId: chatExists.mentorId,
                menteeId: chatExists.menteeId,
                skillId: chatExists.skillId
            },
            select: {
                status: true
            }
        })

        if(!mentorShipRequest || mentorShipRequest.status !== "ACCEPTED") {
            return NextResponse.json({
                message: "Cannot send message in this chat"
            }, {
                status: 403
            })
        }

        const createMessage = await prisma.message.create({
            data: {
                chatId: chatId,
                senderId: userId,
                content: content
            }
        })
        console.log("message: ", createMessage)

        return NextResponse.json({
            message: "Message sent successfully",
            data: createMessage
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating message:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

export async function GET(req: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { chatId } = await context.params
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
        if(!userExists) {
            return NextResponse.json({
                message: "user not found."
            }, {
                status: 404
            })
        }

        const { searchParams } = req.nextUrl
        const limit = Number(searchParams.get("limit")) || 20
        const cursor = searchParams.get("cursor")
        let nextCursor: string | null = null

        const chatExists = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            select: {
                id: true,
                mentorId: true,
                menteeId: true,
                skillId: true
            }
        })
        if (!chatExists) {
            return NextResponse.json({
                message: "Chat not found"
            }, {
                status: 404
            })
        }

        if(chatExists.mentorId !== userId && chatExists.menteeId !== userId) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const messages = await prisma.message.findMany({
            where: {
                chatId: chatId
            },
            select: {
                id: true,
                chatId: true,
                senderId: true,
                content: true,
                createdAt: true,
                isDelivered: true,
                isRead: true,
                readAt: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            })
        })

        if (messages.length > limit) {
            const nextItem = messages.pop()
            nextCursor = nextItem!.id
        }

        return NextResponse.json({
            data: messages,
            pagination: {
                nextCursor,
                limit,
            },
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching messages:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}