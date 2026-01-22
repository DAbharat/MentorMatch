import { z } from "zod";

export const chatSchema = z.object({
  mentorId: z.string().uuid(),
  menteeId: z.string().uuid(),
  createdAt: z.date(),
});

export type Chat = z.infer<typeof chatSchema>;
