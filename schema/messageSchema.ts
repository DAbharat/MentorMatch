import { z } from "zod";

export const messageSchema = z.object({
  chatId: z.string().uuid(), 
  senderId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  createdAt: z.date(),
});

export type Message = z.infer<typeof messageSchema>;
