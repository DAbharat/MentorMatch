import { createServer } from "node:http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { sendMessageSchema } from "@/schema/messageSchema";
import { socketHandshakeSchemaForChat } from "@/schema/socketHandshakeSchema";

// Load environment check first
console.log("ENV PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✅ Set" : "❌ Missing");
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "⚠️ Not set");

// Initialize Prisma with error handling
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

// ✅ Allowed origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

// ✅ HTTP server
const httpServer = createServer((req, res) => {
    // Log all requests for debugging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

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

    // Default fallback for unhandled paths
    res.writeHead(200);
    res.end("OK");
});

// ✅ Socket.IO setup
const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
        origin: (origin, callback) => {
            console.log("Incoming origin:", origin);

            // ✅ allow no-origin (mobile apps, curl, etc.)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // ⚠️ TEMP: allow all (debug phase)
            return callback(null, true);
        },
        credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25000,
    pingTimeout: 60000,
    upgradeTimeout: 10000,
});

// ✅ ENV CHECK
if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing");
}

// ✅ AUTH MIDDLEWARE
io.use(async (socket, next) => {
    try {
        if (!prisma) {
            console.log("❌ Prisma not initialized");
            return next(new Error("Server is not ready"));
        }

        console.log("Handshake auth:", socket.handshake.auth);
        console.log("Handshake origin:", socket.handshake.headers.origin);

        const parsed = socketHandshakeSchemaForChat.safeParse(
            socket.handshake.auth
        );

        if (!parsed.success) {
            console.log("❌ Invalid handshake schema:", parsed.error.message);
            return next(new Error("Invalid handshake data"));
        }

        const { token, chatId, sessionId } = parsed.data;

        if (!token) {
            console.log("❌ NO TOKEN PROVIDED");
            return next(new Error("Missing token"));
        }

        try {
            const session = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY!,
            });

            const userId = session.sub;
            socket.data.userId = userId;
            console.log("✅ User authenticated:", userId);

            if (chatId) {
                const chat = await prisma.chat.findUnique({
                    where: { id: chatId },
                    include: {
                        mentorId: {
                            select: {
                                id: true,
                                name: true,
                                clerkUserId: true
                            }
                        },
                        menteeId: {
                            select: {
                                id: true,
                                name: true,
                                clerkUserId: true
                            }
                        }
                    }
                });

                if (!chat) {
                    console.log("❌ Chat not found:", chatId);
                    return next(new Error("Chat not found"));
                }

                if (chat.mentorId.clerkUserId !== userId && chat.menteeId.clerkUserId !== userId) {
                    console.log("❌ User not part of chat");
                    return next(new Error("Unauthorized"));
                }

                socket.data.chatId = chatId;
                console.log("✅ Chat verified:", chatId);
            }

            if (sessionId) {
                socket.data.sessionId = sessionId;
            }

            next();
        } catch (tokenErr: any) {
            console.log("❌ Token verification failed:", tokenErr.message);
            return next(new Error("Invalid token"));
        }
    } catch (err: any) {
        console.log("❌ MIDDLEWARE ERROR:", err.message);
        next(new Error("Authentication failed"));
    }
});

// ✅ HELPERS
async function validateChat(chatId: string, userId: string) {
    if (!prisma) throw new Error("Server not ready");

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                mentorId: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                },
                menteeId: {
                    select: {
                        id: true,
                        name: true,
                        clerkUserId: true
                    }
                }
            }
        });

        if (!chat) throw new Error("Chat not found");

        if (chat.mentorId.clerkUserId !== userId && chat.menteeId.clerkUserId !== userId) {
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
        console.log("  [validateSession] Looking up session:", sessionId);
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
            console.log("  [validateSession] ❌ Session not found");
            throw new Error("Session not found");
        }

        console.log("  [validateSession] Found session. Status:", session.status);
        console.log("  [validateSession] Mentor ID (clerk):", session.mentor.clerkUserId);
        console.log("  [validateSession] Mentee ID (clerk):", session.mentee.clerkUserId);
        console.log("  [validateSession] Current user ID:", userId);

        if (
            session.mentor.clerkUserId !== userId &&
            session.mentee.clerkUserId !== userId
        ) {
            console.log("  [validateSession] ❌ User is not mentor or mentee of this session");
            throw new Error("Unauthorized");
        }

        if (session.status !== "IN_PROGRESS") {
            console.log("  [validateSession] ❌ Session status is not IN_PROGRESS, it is:", session.status);
            throw new Error("Session is not active");
        }

        console.log("  [validateSession] ✅ Session is valid");
        return session;
    } catch (err: any) {
        console.log("  [validateSession] ❌ Error:", err.message);
        throw new Error(err.message);
    }
}

// ✅ CONNECTION
io.on("connection", async (socket) => {
    const { chatId, userId } = socket.data;

    console.log(`User connected: ${userId}`);
    console.log(`[DEBUG] Socket data on connection:`, socket.data);

    // 🔍 Log ALL incoming events (including WebRTC)
    socket.onAny((eventName: string, ...args: any[]) => {
        console.log(`[ALL EVENTS] ${eventName}`, JSON.stringify(args, null, 2));
    });

    // Also add specific disconnect handling to see connection issues
    socket.on("disconnect", (reason) => {
        console.log(`[DISCONNECT] User ${userId} disconnected. Reason: ${reason}`);
    });

    socket.on("error", (error) => {
        console.log(`[SOCKET ERROR] For user ${userId}:`, error);
    });

    try {
        if (chatId) {
            await validateChat(chatId, userId);
            socket.join(`chat_${chatId}`);
        }

        // 💬 SEND MESSAGE
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

                const message = await prisma.message.create({
                    data: {
                        chatId,
                        senderId: userId,
                        content: content.trim(),
                    },
                });

                io.to(`chat_${chatId}`).emit("new_message", message);
            } catch (err: any) {
                socket.emit("chat:error", {
                    message: "Failed to send message",
                    details: err.message,
                });
            }
        });

        // 🎥 WEBRTC
        socket.on("webrtc:join", async ({ sessionId }) => {
            console.log("\n🎥🎥🎥 ========== WEBRTC:JOIN HANDLER CALLED ========== 🎥🎥🎥");
            console.log("⚡ User:", userId);
            console.log("⚡ Socket ID:", socket.id);
            console.log("⚡ Socket connected:", socket.connected);
            console.log("⚡ SessionId from event:", sessionId);
            console.log("⚡ socket.data.sessionId:", socket.data.sessionId);

            try {
                if (!sessionId) {
                    console.log("❌ VALIDATION FAILED: sessionId is missing");
                    return socket.emit("webrtc:error", { message: "sessionId required" });
                }

                console.log("⚡ Calling validateSession for sessionId:", sessionId, "userId:", userId);
                await validateSession(sessionId, userId);
                console.log("✅ Session validation passed");

                const room = `call_${sessionId}`;
                socket.join(room);
                socket.data.sessionId = sessionId;

                console.log("✅ User joined room:", room);
                console.log("Broadcasting peer-joined to room");
                socket.to(room).emit("webrtc:peer-joined", { userId });
                console.log("✅ ========== WEBRTC:JOIN SUCCESS ==========\n");
            } catch (err: any) {
                console.log("❌ WEBRTC:JOIN FAILED");
                console.log("Error message:", err.message);
                console.log("Error stack:", err.stack);
                console.log("❌ ========== WEBRTC:JOIN ERROR ==========\n");
                socket.emit("webrtc:error", { 
                    message: err.message || "Failed to join WebRTC session"
                });
            }
        });


        socket.on("webrtc:offer", async ({ sessionId, offer }) => {
            try {
                await validateSession(sessionId, userId);
                console.log("\n[WEBRTC:OFFER] ============");
                console.log("[WEBRTC:OFFER] Received from user:", userId);
                console.log("[WEBRTC:OFFER] sessionId:", sessionId);
                console.log("[WEBRTC:OFFER] offer exists:", !!offer);

                if (!sessionId) throw new Error("Session ID required");
                if (!offer) throw new Error("Offer required");

                const room = `call_${sessionId}`;
                console.log("[WEBRTC:OFFER] Broadcasting to room:", room);
                socket.to(room).emit("webrtc:offer", {
                    offer,
                    from: userId,
                });
                console.log("[WEBRTC:OFFER] ✅ Offer sent");
                console.log("[WEBRTC:OFFER] ============\n");
            } catch (err: any) {
                console.error("[WEBRTC:OFFER] ❌ Error:", err.message);
                console.log("[WEBRTC:OFFER] ============\n");
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("webrtc:answer", async ({ sessionId, answer }) => {
            try {
                await validateSession(sessionId, userId);
                console.log("\n[WEBRTC:ANSWER] ============");
                console.log("[WEBRTC:ANSWER] Received from user:", userId);
                console.log("[WEBRTC:ANSWER] sessionId:", sessionId);
                console.log("[WEBRTC:ANSWER] answer exists:", !!answer);

                if (!sessionId) throw new Error("Session ID required");
                if (!answer) throw new Error("Answer required");

                const room = `call_${sessionId}`;
                console.log("[WEBRTC:ANSWER] Broadcasting to room:", room);
                socket.to(room).emit("webrtc:answer", {
                    answer,
                    from: userId,
                });
                console.log("[WEBRTC:ANSWER] ✅ Answer sent");
                console.log("[WEBRTC:ANSWER] ============\n");
            } catch (err: any) {
                console.error("[WEBRTC:ANSWER] ❌ Error:", err.message);
                console.log("[WEBRTC:ANSWER] ============\n");
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("webrtc:ice-candidate", async ({ sessionId, candidate }) => {
            try {
                await validateSession(sessionId, userId);
                console.log("[WEBRTC:ICE] Received from user:", userId, "sessionId:", sessionId);

                if (!sessionId) throw new Error("Session ID required");
                if (!candidate) throw new Error("Candidate required");

                const room = `call_${sessionId}`;
                socket.to(room).emit("webrtc:ice-candidate", {
                    candidate,
                    from: userId,
                });
            } catch (err: any) {
                console.error("[WEBRTC:ICE] ❌ Error:", err.message);
                socket.emit("webrtc:error", { message: err.message });
            }
        });

        socket.on("disconnect", () => {
            const { sessionId } = socket.data;

            console.log(`User disconnected: ${userId}`);

            if (sessionId) {
                socket.to(`call_${sessionId}`).emit("webrtc:peer-left", {
                    userId,
                });
            }
        });

        // ✍️ typing
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

// 🚀 START SERVER
async function startServer() {
    console.log("🚀 Starting Socket.IO server...");

    // Initialize Prisma first
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