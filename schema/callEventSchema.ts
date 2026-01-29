import { z } from 'zod';

export const callEventSchema = z.object({
    sessionId: z.string().uuid(),
    eventType: z.enum(["JOINED", "LEFT", "DISCONNECTED"])
})

export type CallEventSchema = z.infer<typeof callEventSchema>;