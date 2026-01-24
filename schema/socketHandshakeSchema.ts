import { z } from "zod";

export const socketHandshakeSchema = z.object({
    token: z.string().min(1),
    chatId: z.string().uuid(),
})

export type SocketHandshake = z.infer<typeof socketHandshakeSchema>;