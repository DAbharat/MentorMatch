import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { userCreationSchema } from "@/schema/usercreationSchema";
import { z } from "zod";

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parsed = userCreationSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const idErrors = tree.properties?.id?.errors || []
        const emailErrors = tree.properties?.email?.errors || []
        const nameErrors = tree.properties?.name?.errors || []
        const message = [...idErrors, ...emailErrors, ...nameErrors].join(", ") || "Invalid input"

        return NextResponse.json({
            message
        }, {
            status: 400
        })
    }

    try {
        const { id, email, name } = parsed.data
        console.log("info received: ", parsed.data)
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        id: id
                    },
                    {
                        email: email
                    }
                ]
            }
        })

        if(userExists) {
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
                id,
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
        console.error("Error creating user:", error.message)
        return NextResponse.json({
            message: "An error occurred while creating the user."
        }, {
            status: 500
        })
    }
}