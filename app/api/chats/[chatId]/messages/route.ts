import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { messageSchema } from "@/schema/messageSchema";
import z from "zod";

export async function POST(req: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const body = await req.json()
    const parsed = messageSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const contentErrors = tree.properties?.content?.errors || []
        const chatIdErrors = tree.properties?.chatId?.errors || []
        const message = [...contentErrors, ...chatIdErrors].join(", ") || "Invalid request body"

        return Response.json({
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    try {
        const { chatId, content } = parsed.data
        const chatExists = await prisma.chat.findUnique({
            where: {
                id: chatId
            }
        })

        if (!chatExists) {
            return Response.json({
                message: "Chat not found"
            }, {
                status: 404
            })
        }

        if (userId !== chatExists.mentorId && userId !== chatExists.menteeId) {
            return Response.json({
                message: "Unauthorized"
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

        return Response.json({
            message: "Message sent successfully",
            data: createMessage
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Error creating message:", error)
        return Response.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

export async function GET(req: NextRequest,
    { params }: { params: { chatId: string } }
) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { chatId } = params

    if (!chatId) {
        return Response.json({
            message: "Chat ID is required"
        }, {
            status: 400
        })
    }

    try {
        const { searchParams } = req.nextUrl
        const limit = Number(searchParams.get("limit")) || 20
        const cursor = searchParams.get("cursor")
        let nextCursor: string | null = null

        const chatExists = await prisma.chat.findUnique({
            where: {
                id: chatId
            }
        })

        if (!chatExists) {
            return Response.json({
                message: "Chat not found"
            }, {
                status: 404
            })
        }

        if (userId !== chatExists.mentorId && userId !== chatExists.menteeId) {
            return Response.json({
                message: "Unauthorized"
            }, {
                status: 403
            })
        }

        const messages = await prisma.message.findMany({
            where: {
                chatId: chatId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            select: {
                id: true,
                chatId: true,
                senderId: true,
                content: true,
                createdAt: true
            }
        })

        if (messages.length > limit) {
            const nextItem = messages.pop()
            nextCursor = nextItem!.id
        }

        return Response.json({
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
        return Response.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}