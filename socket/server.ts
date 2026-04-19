import { createServer } from "node:http";
import { Server } from "socket.io";
import { sendMessageSchema } from "@/schema/messageSchema";
import { socketHandshakeSchemaForChat } from "@/schema/socketHandshakeSchema";
import { verifyToken } from "@/lib/auth";

console.log("ENV PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Missing");
console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET ? "Set" : "Missing");
console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET ? "Set" : "Missing");
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "Not set");

const userSocketMap = new Map<string, string>()

let prisma: any = null;
let prismaInitializing = false;

async function initPrisma() {
    if (prismaInitializing) {

        let retries = 0;
        while (!prisma && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        return !!prisma;
    }

    prismaInitializing = true;
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is not set");
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET is missing");
        }
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("REFRESH_TOKEN_SECRET is missing");
        }

        try {
            const prismaModule = await import("@/lib/prisma");
            
            const prismaDefault = prismaModule.default as any;
            const prismaExport = prismaModule.prisma as any;
            
            let candidate = null;
            
            if (prismaDefault && typeof prismaDefault === 'object' && 'session' in prismaDefault) {
                candidate = prismaDefault;
            }
            
            if (!candidate && prismaExport && typeof prismaExport === 'object' && 'session' in prismaExport) {
                candidate = prismaExport;
            }
            
            if (!candidate) {
                for (const [key, value] of Object.entries(prismaModule)) {
                    if (value && typeof value === 'object' && 'session' in value) {
                        candidate = value as any;
                        break;
                    }
                }
            }
            
            if (!candidate) {
                console.error("Failed to find PrismaClient with session model in any export");
                throw new Error("Could not find Prisma session model in any export");
            }
            
            prisma = candidate;
            console.log("✓ Prisma initialized successfully");
            
        } catch (importErr: any) {
            console.error("Failed to import Prisma:", importErr.message);
            throw importErr;
        }

        return true;

    } catch (err: any) {
        console.error("Failed to initialize Prisma:", err.message);
        prisma = null;
        return false;
    } finally {
        prismaInitializing = false;
    }
}

const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [ process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean);

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

io.use(async (socket, next) => {
    try {
        if (!prisma) {
            console.error("Prisma not initialized");
            return next(new Error("Server is not ready"));
        }

        const authData = socket.handshake.auth || socket.handshake.query || {};
        
        const parsed = socketHandshakeSchemaForChat.safeParse(authData);

        if (!parsed.success) {
            console.error("Invalid handshake schema");
            return next(new Error("Invalid handshake data"));
        }

        const { token, chatId, sessionId } = parsed.data;

        if (!token) {
            console.error("NO TOKEN PROVIDED");
            return next(new Error("Missing token"));
        }

        try {
            const payload = verifyToken(token, "access")

            if(!payload || !payload.userId) {
                console.error("Invalid token payload")
                return next(new Error("Invalid token"))
            }

            const userId = payload.userId;
            socket.data.userId = userId;

            if (chatId) {
                const chat = await prisma.chat.findUnique({
                    where: { id: chatId },
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
                        }
                    }
                });

                if (!chat) {
                    console.error("Chat not found:", chatId);
                    return next(new Error("Chat not found"));
                }

                if (chat.mentor.id !== userId && chat.mentee.id !== userId) {
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
    if (!prisma) {
        throw new Error("Server not ready");
    }

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
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
                }
            }
        });

        if (!chat) throw new Error("Chat not found");

        if (chat.mentor.id !== userId && chat.mentee.id !== userId) {
            throw new Error("Unauthorized");
        }

        return chat;

    } catch (err: any) {
        console.error("validateChat error:", err.message);
        throw err;
    }
}

async function validateSession(sessionId: string, userId: string) {
    if (!prisma) {
        throw new Error("Server error: Database not initialized");
    }

    if (!prisma.session) {
        throw new Error("Server error: Session model not available");
    }

    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
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
                }
            }
        });

        if (!session) {
            throw new Error("Session not found");
        }

        if (
            session.mentor.id !== userId &&
            session.mentee.id !== userId
        ) {
            throw new Error("Unauthorized");
        }

        if (session.status !== "IN_PROGRESS") {
            throw new Error("Session is not active");
        }

        return session;
    } catch (err: any) {
        console.error("validateSession error:", err.message);
        throw err;
    }
}

io.on("connection", async (socket) => {
    const { chatId, userId } = socket.data;
    
    if (!prisma) {
        console.error("Connection attempted but Prisma not ready");
        socket.emit("connection:error", { message: "Server not ready" });
        socket.disconnect();
        return;
    }

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
                    where: { 
                        id: userId 
                    }
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

                const menteeId = session.mentee.id;
                const menteeSocketId = userSocketMap.get(menteeId);

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
    console.log("Starting Socket.IO server...");

    const prismaReady = await initPrisma();

    if (!prismaReady || !prisma) {
        console.error("FATAL: Failed to initialize Prisma");
        console.error("Prisma state:", {
            exists: !!prisma,
            hasSession: prisma?.session ? true : false,
        });
        console.error("\nTroubleshooting:");
        console.error("1. Ensure Prisma has been generated: npm run prisma:generate");
        console.error("2. Check if @/lib/prisma.ts is exporting the PrismaClient correctly");
        console.error("3. Verify DATABASE_URL is set correctly");
        process.exit(1);
    }

    if (!prisma.session || !prisma.chat) {
        console.error("FATAL: Prisma initialized but models are missing");
        console.error("Available properties:", Object.keys(prisma).slice(0, 30));
        console.error("\nThis likely means:");
        console.error("1. Prisma Client was not generated after schema changes");
        console.error("2. The Prisma schema needs to be run: npx prisma generate");
        process.exit(1);
    }

    console.log("✓ Prisma is ready with all required models");
    console.log("✓ Session model available");
    console.log("✓ Chat model available");

    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`✓ Socket server is running on port: ${PORT}`);
        console.log(`✓ Socket.IO path: /socket.io`);
        console.log(`✓ Transports: websocket, polling`);
        console.log("✓ Server is ready to accept connections");
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});