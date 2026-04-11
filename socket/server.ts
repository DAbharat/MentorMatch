import { createServer } from "node:http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { sendMessageSchema } from "@/schema/messageSchema";
import { socketHandshakeSchemaForChat } from "@/schema/socketHandshakeSchema";

console.log("ENV PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing");
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "⚠️ Not set");

const userSocketMap = new Map<string, string>()

let prisma: any = null;
async function initPrisma() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is not set");
        }
        if (!process.env.CLERK_SECRET_KEY) {
            throw new Error("CLERK_SECRET_KEY is missing");
        }
        const { default: prismaClient } = await import("@/lib/prisma");
        prisma = prismaClient;
        console.log("✅ Prisma initialized");
        return true;
    } catch (err: any) {
        console.error("❌ Failed to initialize Prisma:", err.message);
        return false;
    }
}

const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [ "http://localhost:3000", "http://localhost:3001", process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

const httpServer = createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            status: "ok",
            prisma: prisma ? "connected" : "disconnected",
            socket_io: "running"
        }));
        return;
    }

    if (req.url === "/live" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "alive" }));
        return;
    }

    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Socket.IO server is running");
        return;
    }

    res.writeHead(200);
    res.end("OK");
});

const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, true);
        },
        credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25000,
    pingTimeout: 60000,
    upgradeTimeout: 10000,
});

if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing");
}

io.use(async (socket, next) => {
    try {
        if (!prisma) {
            console.error("Prisma not initialized");
            return next(new Error("Server is not ready"));
        }

        const parsed = socketHandshakeSchemaForChat.safeParse(
            socket.handshake.auth
        );

        if (!parsed.success) {
            console.error("Invalid handshake schema:", parsed.error.message);
            return next(new Error("Invalid handshake data"));
        }

        const { token, chatId, sessionId } = parsed.data;

        if (!token) {
            console.error("NO TOKEN PROVIDED");
            return next(new Error("Missing token"));
        }

        try {
            const session = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY!,
            });

            const userId = session.sub;
            socket.data.userId = userId;

            if (chatId) {
                const chat = await prisma.chat.findUnique({
                    where: { id: chatId },
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
                        }
                    }
                });

                if (!chat) {
                    console.error("Chat not found:", chatId);
                    return next(new Error("Chat not found"));
                }

                if (chat.mentor.clerkUserId !== userId && chat.mentee.clerkUserId !== userId) {
                    console.error("User not part of chat");
                    return next(new Error("Unauthorized"));
                }

                socket.data.chatId = chatId;
            }

            if (sessionId) {
                socket.data.sessionId = sessionId;
            }

            next();
        } catch (tokenErr: any) {
            console.error("Token verification failed:", tokenErr.message);
            return next(new Error("Invalid token"));
        }
    } catch (err: any) {
        console.error("Authentication failed:", err.message);
        next(new Error("Authentication failed"));
    }
});

async function validateChat(chatId: string, userId: string) {
    if (!prisma) throw new Error("Server not ready");

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
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
                }
            }
        });

        if (!chat) throw new Error("Chat not found");

        if (chat.mentor.clerkUserId !== userId && chat.mentee.clerkUserId !== userId) {
            throw new Error("Unauthorized");
        }

        return chat;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

async function validateSession(sessionId: string, userId: string) {
    if (!prisma) throw new Error("Server not ready");

    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
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
                }
            }
        });

        if (!session) {
            throw new Error("Session not found");
        }

        if (
            session.mentor.clerkUserId !== userId &&
            session.mentee.clerkUserId !== userId
        ) {
            throw new Error("Unauthorized");
        }

        if (session.status !== "IN_PROGRESS") {
            throw new Error("Session is not active");
        }

        return session;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

io.on("connection", async (socket) => {
    const { chatId, userId } = socket.data;
    userSocketMap.set(userId, socket.id);

    socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
    });

    try {
        if (chatId) {
            await validateChat(chatId, userId);
            socket.join(`chat_${chatId}`);
        }

        socket.on("send_message", async (payload) => {
            try {
                if (!prisma) {
                    return socket.emit("chat:error", {
                        message: "Server not ready",
                    });
                }

                const chatId = socket.data.chatId;

                if (!chatId) {
                    return socket.emit("chat:error", {
                        message: "Chat context missing",
                    });
                }

                await validateChat(chatId, userId);

                const parsed = sendMessageSchema.safeParse(payload);
                if (!parsed.success) return;

                const { content } = parsed.data;
                if (!content.trim()) return;

                const user = await prisma.user.findUnique({
                    where: { clerkUserId: userId }
                });

                if (!user) {
                    return socket.emit("chat:error", {
                        message: "User not found in database",
                    });
                }

                const message = await prisma.message.create({
                    data: {
                        chatId,
                        senderId: user.id,
                        content: content.trim(),
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                clerkUserId: true
                            }
                        }
                    }
                });

                io.to(`chat_${chatId}`).emit("new_message", message);
            } catch (err: any) {
                console.error("Error sending message:", err.message);
                socket.emit("chat:error", {
                    message: "Failed to send message",
                    details: err.message,
                });
            }
        });

        socket.on("session:start", async ({ sessionId }) => {
            try {
                if (!sessionId) {
                    return socket.emit("session:error", { 
                        message: "Session ID required" 
                    });
                }

                const session = await validateSession(sessionId, userId);

                const menteeClerkId = session.mentee.clerkUserId;
                const menteeSocketId = userSocketMap.get(menteeClerkId);

                if(!menteeSocketId) {
                    return socket.emit("session:error", {
                        message: "Mentee is not online"
                    })
                }

                io.to(menteeSocketId).emit("session:started", {
                    sessionId,
                    mentor: session.mentor,
                    mentee: session.mentee,
                })

                socket.emit("session:started:ack", { sessionId })

            } catch (error) {
                socket.emit("session:error", { message: "Failed to start session" });
            }
        })

        socket.on("webrtc:join", async ({ sessionId }) => {
            try {
                if (!sessionId) {
                    return socket.emit("webrtc:error", { message: "sessionId required" });
                }

                await validateSession(sessionId, userId);

                const room = `call_${sessionId}`;
                socket.join(room);
                socket.data.sessionId = sessionId;

                socket.to(room).emit("webrtc:peer-joined", { userId });
            } catch (err: any) {
                console.error("WebRTC join error:", err.message);
                socket.emit("webrtc:error", {
                    message: err.message || "Failed to join WebRTC session"
                });
            }
        });


        socket.on("webrtc:offer", async ({ sessionId, offer }) => {
            try {
                await validateSession(sessionId, userId);

                if (!sessionId) throw new Error("Session ID required");
                if (!offer) throw new Error("Offer required");

                const room = `call_${sessionId}`;
                socket.to(room).emit("webrtc:offer", {
                    offer,
                    from: userId,
                });
            } catch (err: any) {
                console.error("WebRTC offer error:", err.message);
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("webrtc:answer", async ({ sessionId, answer }) => {
            try {
                await validateSession(sessionId, userId);

                if (!sessionId) throw new Error("Session ID required");
                if (!answer) throw new Error("Answer required");

                const room = `call_${sessionId}`;
                socket.to(room).emit("webrtc:answer", {
                    answer,
                    from: userId,
                });
            } catch (err: any) {
                console.error("WebRTC answer error:", err.message);
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("webrtc:ice-candidate", async ({ sessionId, candidate }) => {
            try {
                await validateSession(sessionId, userId);

                if (!sessionId) throw new Error("Session ID required");
                if (!candidate) throw new Error("Candidate required");

                const room = `call_${sessionId}`;
                socket.to(room).emit("webrtc:ice-candidate", {
                    candidate,
                    from: userId,
                });
            } catch (err: any) {
                console.error("WebRTC ICE candidate error:", err.message);
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("disconnect", () => {
            const { sessionId } = socket.data;

            userSocketMap.delete(userId);
            console.log(`User ${userId} disconnected. Map size: ${userSocketMap.size}`);

            if (sessionId) {
                socket.to(`call_${sessionId}`).emit("webrtc:peer-left", {
                    userId,
                });
            }
        });

        socket.on("typing", async () => {
            if (!chatId) return;
            await validateChat(chatId, userId);

            socket.to(`chat_${chatId}`).emit("typing", { userId });
        });

        socket.on("stop_typing", async () => {
            if (!chatId) return;
            await validateChat(chatId, userId);

            socket.to(`chat_${chatId}`).emit("stop_typing", { userId });
        });
    } catch (error) {
        console.error("Connection error:", error);
    }
});

async function startServer() {
    console.log("🚀 Starting Socket.IO server...");

    const prismaReady = await initPrisma();

    if (!prismaReady) {
        console.warn("⚠️  Server starting without database - Socket.IO will work but database operations will fail");
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Socket server is running on port: ${PORT}`);
        console.log(`📡 Socket.IO path: /socket.io`);
        console.log(`⚡ Transports: websocket, polling`);
    });
}

startServer().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});