import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/schema/profileSchema";
import { z } from "zod";
import { resolveSkills } from "@/lib/skills";

export async function GET(req: NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    try {
        const userProfile = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                bio: true,
                skillsOffered: true,
                skillsWanted: true,
                averageRating: true,
                createdAt: true
            }
        })

        if(!userProfile) {
            return NextResponse.json({
                message: "User profile not found"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            message: "User profile fetched successfully",
            data: userProfile
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}

export async function PATCH(req: NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const bioErrors = tree.properties?.bio?.errors || []
        const nameErrors = tree.properties?.name?.errors || []
        const skillsWantedErrors = tree.properties?.skillsWanted?.errors || []
        const skillsOfferedErrors = tree.properties?.skillsOffered?.errors || []
        const message = [...bioErrors, ...nameErrors, ...skillsWantedErrors, ...skillsOfferedErrors].join(", ") || "Invalid request body"

        return NextResponse.json({
            message: message,
            errors: tree
        }, {
            status: 400
        })
    }

    try {
        const { bio, name, skillsWanted, skillsOffered } = parsed.data

        const data: any = {}

        if(name !== undefined) data.name = name
        if(bio !== undefined) data.bio = bio

        if(skillsOffered) {
            const skillIds = await resolveSkills(skillsOffered)
            data.skillsOffered = {
                set: skillIds
            }
        }

        if(skillsWanted) {
            const skillIds = await resolveSkills(skillsWanted)
            data.skillsWanted = {
                set: skillIds
            }
        }

        const updateProfile = await prisma.user.update({
            where: {
                id: userId
            }, 
            data,
            select: {
                id: true,
                name: true,
                bio: true,
                skillsOffered: true,
                skillsWanted: true
            }
        })

        return NextResponse.json({
            message: "Profile updated successfully",
            data: updateProfile
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}