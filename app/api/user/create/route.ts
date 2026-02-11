import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { userCreationSchema } from "@/schema/usercreationSchema";
import { z } from "zod";

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parsed = userCreationSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const clerkUserIdErrors = tree.properties?.clerkUserId?.errors || []
        const emailErrors = tree.properties?.email?.errors || []
        const nameErrors = tree.properties?.name?.errors || []
        const message = [...clerkUserIdErrors, ...emailErrors, ...nameErrors].join(", ") || "Invalid input"

        return NextResponse.json({
            message
        }, {
            status: 400
        })
    }

    try {
        const { clerkUserId, email, name } = parsed.data
        console.log("info received: ", parsed.data)

        console.log("POST /api/user/create: Received data:", { clerkUserId, email, name });

        if (!clerkUserId || !email || !name) {
            console.error("POST /api/user/create: Missing required fields.");
            return NextResponse.json({
                message: "Missing required fields: clerkUserId, email, or name."
            }, {
                status: 400
            });
        }


        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        clerkUserId: clerkUserId
                    },
                    {
                        email: email
                    }
                ]
            }
        })

        if (userExists) {
            console.log("user Exists: ", userExists)
            return NextResponse.json({
                message: "User with this ID or email already exists.",
                data: userExists
            }, {
                status: 400
            })
        }

        const createUser = await prisma.user.create({
            data: {
                clerkUserId,
                email,
                name
            }
        })

        return NextResponse.json({
            message: "User created successfully",
            data: createUser
        }, {
            status: 201
        })
    } catch (error: any) {
        console.error("Error creating user:", error); // Log the full error object
        if (error.code === 'P2002') {
            return NextResponse.json({
                message: `Unique constraint violation: A user with this ${error.meta.target} already exists.`
            }, {
                status: 400
            });
        }
        return NextResponse.json({
            message: "An error occurred while creating the user."
        }, {
            status: 500
        })
    }
}