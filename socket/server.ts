import { createServer } from "node:http";
import { Server } from "socket.io"
import prisma from "@/lib/prisma";
import { verifyToken } from "@clerk/backend";
import { sendMessageSchema } from "@/schema/messageSchema";
import { socketHandshakeSchemaForChat } from "@/schema/socketHandshakeSchema";


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
        const parsed = socketHandshakeSchemaForChat.safeParse(socket.handshake.auth)

        if (!parsed.success) {
            return next(new Error("Invalid handshake data"))
        }

        const { token, chatId } = parsed.data

        if (!token) {
            return next(new Error("Unauthorized"))
        }

        const session = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!
        })

        const userId = session.sub
        socket.data.userId = userId

        if (chatId) {
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

            socket.data.chatId = chatId
        }

        next()
    } catch (error: any) {
        next(new Error("Unauthorized"))
    }
})

async function validateChat(chatId: string, userId: string) {
    try {
        const findChat = await prisma.chat.findUnique({
            where: {
                id: chatId
            }
        })

        if (!findChat) {
            throw new Error("Chat not found")
        }

        const isMentor = findChat.mentorId === userId
        const isMentee = findChat.menteeId === userId

        if (!isMentor && !isMentee) {
            throw new Error("Unauthorized")
        }

        return findChat
    } catch (error: any) {
        console.error("Chat validation error:", error)
        throw new Error(error.message || "Chat validation failed")
    }
}

async function validateSession(sessionId: string, userId: string) {
    try {
        const findSession = await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })

        if (!findSession) {
            throw new Error("Session not found")
        }

        const isMentor = findSession.mentorId === userId
        const isMentee = findSession.menteeId === userId

        if (!isMentor && !isMentee) {
            throw new Error("Unauthorized")
        }

        if (findSession.status !== "IN_PROGRESS") {
            throw new Error("Session is not active")
        }

        return findSession
    } catch (error: any) {
        console.error("Session validation error:", error)
        throw new Error(error.message || "Session validation failed")
    }
}

io.on("connection", async (socket) => {
    const { chatId, userId } = socket.data

    try {

        if (chatId) {
            await validateChat(chatId, userId)

            socket.join(`chat_${chatId}`)
            console.log(`User: ${userId} joined chat: ${chatId}`)
        }

        socket.on("send_message", async (payload) => {
            try {
                const chatId = socket.data.chatId

                if (!chatId) {
                    socket.emit("chat:error", {
                        message: "Chat context missing"
                    })
                    return
                }

                await validateChat(chatId, socket.data.userId)

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

            } catch (error: any) {
                console.error("Error creating message:", error)
                socket.emit("chat:error", {
                    message: "Failed to send message",
                    details: error.message || "Unknown error"
                })
            }
        })


        socket.on("webrtc:join", async ({ sessionId }) => {
            try {
                if (!sessionId) {
                    throw new Error("Session ID is required")
                }

                await validateSession(sessionId, socket.data.userId)

                const callRoom = `call_${sessionId}`
                socket.join(callRoom)
                socket.data.sessionId = sessionId

                socket.to(callRoom).emit("webrtc:peer-joined", {
                    userId: socket.data.userId
                })
            } catch (error: any) {
                socket.emit("webrtc:error", {
                    message: "Join call failed",
                    details: error.message || "Unknown error"
                })
            }
        })

        socket.on("webrtc:offer", async ({ sessionId, offer }) => {
            try {
                if (!sessionId || !offer) {
                    throw new Error("Session ID and offer are required")
                }

                if (!(socket.data.sessionId === sessionId)) {
                    throw new Error("You must join the call before sending an offer")
                }

                await validateSession(sessionId, socket.data.userId)

                const callRoom = `call_${sessionId}`

                socket.to(callRoom).emit("webrtc:offer", {
                    offer,
                    from: socket.data.userId
                })

            } catch (error: any) {
                socket.emit("webrtc:error", {
                    message: "Offer failed",
                    details: error.message || "Unknown error"
                })
            }
        })

        socket.on("webrtc:answer", async ({ sessionId, answer }) => {
            try {

                if (!sessionId || !answer) {
                    throw new Error("Session ID and answer are required")
                }

                if (!(socket.data.sessionId === sessionId)) {
                    throw new Error("You must join the call before sending signaling data")
                }

                await validateSession(sessionId, socket.data.userId)

                const callRoom = `call_${sessionId}`

                socket.to(callRoom).emit("webrtc:answer", {
                    answer,
                    from: socket.data.userId
                })

            } catch (error: any) {
                socket.emit("webrtc:error", {
                    message: "Answer failed",
                    details: error.message || "Unknown error"
                })
            }
        })

        socket.on("webrtc:ice-candidate", async ({ sessionId, candidate }) => {

            try {
                if (!sessionId || !candidate) {
                    throw new Error("Session ID and candidate are required")
                }

                if (!(socket.data.sessionId === sessionId)) {
                    throw new Error("You must join the call before sending signaling data")
                }

                await validateSession(sessionId, socket.data.userId)

                const callRoom = `call_${sessionId}`

                socket.to(callRoom).emit("webrtc:ice-candidate", {
                    candidate,
                    from: socket.data.userId
                })

            } catch (error: any) {
                socket.emit("webrtc:error", {
                    message: "ICE candidate failed",
                    details: error.message || "Unknown error"
                })
            }
        })

        socket.on("webrtc:leave", async ({ sessionId }) => {
            try {
                if (!sessionId) {
                    throw new Error("Session ID is required")
                }

                if (socket.data.sessionId !== sessionId) return

                const callRoom = `call_${sessionId}`

                socket.leave(callRoom)
                socket.data.sessionId = null

                socket.to(callRoom).emit("webrtc:peer-left", {
                    userId: socket.data.userId
                })

            } catch (error: any) {
                socket.emit("webrtc:error", {
                    message: "Leave call failed",
                    details: error.message || "Unknown error"
                })
            }
        })

        socket.on("disconnect", () => {
            const { userId, sessionId } = socket.data

            console.log(`User: ${userId} disconnected`)

            if (sessionId) {
                const callRoom = `call_${sessionId}`

                socket.to(callRoom).emit("webrtc:peer-left", {
                    userId
                })
                socket.data.sessionId = null
            }
        })

        socket.on("chat:error", (error) => {
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

        socket.on("typing", async () => {
            const chatId = socket.data.chatId

            if (!chatId) {
                socket.emit("chat:error", {
                    message: "Chat context missing",
                    details: "Typing event without chat"
                })
                return
            }

            await validateChat(chatId, socket.data.userId)

            socket.to(`chat_${socket.data.chatId}`).emit("typing", { userId: socket.data.userId })
        })

        socket.on("stop_typing", async () => {
            const chatId = socket.data.chatId

            if (!chatId) {
                socket.emit("chat:error", {
                    message: "Chat context missing",
                    details: "Stop typing event without chat"
                })
                return
            }

            await validateChat(chatId, socket.data.userId)

            socket.to(`chat_${socket.data.chatId}`).emit("stop_typing", { userId: socket.data.userId })
        })

    } catch (error: any) {
        console.error("Error in socket connection:", error)
    }
})

httpServer.listen(PORT, () => {
    console.log(`Socket server is running on port: ${PORT}`)
})

