import { z } from 'zod';

export const createSessionSchema = z.object({
    mentorId: z.string().uuid(),
    menteeId: z.string().uuid(),
    skillId: z.string().uuid(),

    scheduledAt: z.coerce.date(),
    totalCallDuration: z.number().max(30),
})

export const sessionStatusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
])

export const updateSessionSchema = z.object({
    action: z.enum(["CONFIRM", "START", "COMPLETE", "CANCEL"]),
})

export const sessionSchema = z.object({
    id: z.string().uuid(),
    mentorId: z.string().uuid(),
    menteeId: z.string().uuid(),
    skillId: z.string().uuid(),

    scheduledAt: z.date(),

    status: sessionStatusSchema,

    roomId: z.string().uuid(),

    callStartedAt: z.date().nullable(),
    callEndedAt: z.date().nullable(),
    totalCallDurationMin: z.number(),
    completedBy: z.enum(["Mentor", "Auto"]),

    createdAt: z.date(),
})

export type CreateSession = z.infer<typeof createSessionSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;
export type Session = z.infer<typeof sessionSchema>;