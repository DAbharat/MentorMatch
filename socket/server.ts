import { createServer } from "node:http";
import { Server } from "socket.io"
import prisma from "@/lib/prisma";
import { verifyToken } from "@clerk/backend";
import { sendMessageSchema } from "@/schema/messageSchema";
import { socketHandshakeSchema } from "@/schema/socketHandshakeSchema";


const PORT = Number(process.env.SOCKET_PORT) || 4000
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const httpServer = createServer()

const io = new Server(httpServer, {
    cors: {
        origin: APP_URL,
        credentials: true
    }
})

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is missing")
}

io.use(async (socket, next) => {
    try {
        const parsed = socketHandshakeSchema.safeParse(socket.handshake.auth)

        if(!parsed.success) {
            return next(new Error("Invalid handshake data"))
        }

        const { token, chatId } = parsed.data

        if (!token || !chatId) {
            return next(new Error("Unauthorized"))
        }

        const session = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!
        })
        const userId = session.sub

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId
            }
        })

        if (!chat) {
            return next(new Error("Chat not found"))
        }

        const isMentor = userId === chat?.mentorId
        const isMentee = userId === chat?.menteeId

        if (!isMentor && !isMentee) {
            return next(new Error("Unauthorized"))
        }

        socket.data.userId = userId
        socket.data.chatId = chatId

        next()
    } catch (error) {
        next(new Error("Unauthorized"))
    }
})

io.on("connection", (socket) => {
    const { chatId, userId } = socket.data

    try {
        socket.join(`chat_${chatId}`)
        console.log(`User: ${userId}, has joined the chat: ${chatId}`)

        try {
            socket.on("send_message", async (payload) => {
                const parsed = sendMessageSchema.safeParse(payload)
                if (!parsed.success) {
                    console.error("Invalid message payload")
                    return
                }
    
                const { content } = parsed.data

                if (!content.trim()) return
    
                const createMessage = await prisma.message.create({
                    data: {
                        chatId: chatId,
                        senderId: userId,
                        content: content.trim()
                    },
                    select: {
                        id: true,
                        chatId: true,
                        senderId: true,
                        content: true,
                        createdAt: true
                    }
                })
                io.to(`chat_${socket.data.chatId}`).emit("new_message", createMessage)
            })
        } catch (error) {
            console.error("Error handling send_message event:", error)
        }

        socket.on("disconnect", () => {
            console.log(`User: ${userId} has left the chat: ${chatId}`)
        })

        socket.on("error", (error) => {
            console.error("Socket error:", error)
        })

        socket.on("disconnect_error", (error) => {
            console.error("Socket disconnect error:", error)
        })

        socket.on("online-user", () => {
            console.log(`User online: ${socket.data.userId}`)
        })

        socket.on("offline-user", () => {
            console.log(`User offline: ${socket.data.userId}`)
        })

        socket.on("typing", () => {
            socket.to(`chat_${socket.data.chatId}`).emit("typing", { userId: socket.data.userId })
        })

        socket.on("stop_typing", () => {
            socket.to(`chat_${socket.data.chatId}`).emit("stop_typing", { userId: socket.data.userId })
        })

    } catch (error) {
        console.error("Error in socket connection:", error)
    }
})

httpServer.listen(PORT, () => {
    console.log(`Socket server is running on port: ${PORT}`)
})