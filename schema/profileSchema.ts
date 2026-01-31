import { z } from "zod";

export const updateProfileSchema = z.object({
    email: z.string().email("Invalid email address").optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters long").optional(),
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),

    skillsWanted: z.array(z.string())
    .min(1, "At least one skill is required")
    .refine(arr => new Set(arr).size === arr.length, "Duplicate skills are not allowed")
    .optional(),

    skillsOffered: z.array(z.string())
    .refine(arr => new Set(arr).size === arr.length, "Duplicate skills are not allowed")
    .optional(),
})

export const userPublicProfileSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().max(500).optional(),
    skillsWanted: z.array(z.string()).optional(),
    skillsOffered: z.array(z.string()).optional(),
    averageRating: z.number().min(0).max(5).optional(),
    joinYear: z.number().optional(), 
    sessionsCompletedAsMentor: z.number().optional(),
    sessionsCompletedAsMentee: z.number().optional(),
})


export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPublicProfile = z.infer<typeof userPublicProfileSchema>;