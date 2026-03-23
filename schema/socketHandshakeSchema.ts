import { z } from "zod";

export const socketHandshakeSchemaForChat = z.object({
    token: z.string().min(1),
    chatId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
})

export type SocketHandshake = z.infer<typeof socketHandshakeSchemaForChat>;