import { z } from "zod";

export const userRegisterSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z
        .string()
        .trim()
        .min(3, "Password should be atleast 3 characters")
        .max(50, "Password should be atmost 50 characters")
        .regex(/[A-Z]/, "Must include uppercase")
        .regex(/[a-z]/, "Must include lowercase")
        .regex(/[0-9]/, "Must include number")
})

export const userCreationSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    password: z
        .string()
        .trim()
        .min(3, "Password should be atleast 3 characters")
        .max(50, "Password should be atmost 50 characters")
        .regex(/[A-Z]/, "Must include uppercase")
        .regex(/[a-z]/, "Must include lowercase")
        .regex(/[0-9]/, "Must include number"),

    email: z.string().trim().email("Invalid email address")
})

export const userLoginSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z
        .string()
        .trim()
        .min(1, "Password is required")
})

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserCreationInput = z.infer<typeof userCreationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;