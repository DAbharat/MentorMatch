import { z } from "zod";

export const userCreationSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    clerkUserId: z.string().trim().min(1, "User ID is required"),
    email: z.string().trim().email("Invalid email address")
})

export type UserCreationInput = z.infer<typeof userCreationSchema>;