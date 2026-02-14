import { z } from "zod"

export const createMentorshipRequestSchema = z.object({
  initialMessage: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message cannot exceed 500 characters"),
  skillId: z.string().uuid("Invalid skill ID")
})

export const updateMentorshipRequestStatusSchema = z.object({
  status: z.enum(["ACCEPT", "REJECT"]),
})

export type CreateMentorshipRequestInput = z.infer<typeof createMentorshipRequestSchema>;
export type UpdateMentorshipRequestStatusInput = z.infer<typeof updateMentorshipRequestStatusSchema>;