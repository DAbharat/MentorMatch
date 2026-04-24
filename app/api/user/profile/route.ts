import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/schema/profileSchema";
import { z } from "zod";
import { resolveSkills } from "@/lib/skills";
import { getSessionFromRequest } from "@/lib/auth";
import  { cacheGet, cacheSet, buildCacheKey, cacheDelete, cacheInvalidatePattern } from "@/lib/cache"

const CACHE_PREFIX = "cache:v1";

export async function GET(req: NextRequest) {

    const userId = getSessionFromRequest(req)

    console.log("GET /api/user/profile: userId from auth middleware:", userId);

    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const cacheKey = buildCacheKey("user", "profile", userId)

    console.log("GET /api/user/profile: userId", userId);

    try {
        const cached = await cacheGet<any>(cacheKey)
        if(cached) {
            return NextResponse.json({
                message: "User profile fetched (cache)",
                data: cached
            }, {
                status: 200
            })
        }

        const userProfile = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                bio: true,
                averageRating: true,
                ratingCount: true,
                skillsOffered: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                skillsWanted: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        sessionsAsMentor: {
                            where: {
                                status: "COMPLETED"
                            }
                        },
                        sessionsAsMentee: {
                            where: {
                                status: "COMPLETED"
                            }
                        }
                    }
                },
                createdAt: true
            }
        })
        if (!userProfile) {
            return NextResponse.json({
                message: "User profile not found"
            }, {
                status: 404
            })
        }

        const joinedAt = new Date(userProfile.createdAt).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short" }
        );

        const data = {
            id: userProfile.id,
            name: userProfile.name,
            bio: userProfile.bio,
            createdAt: userProfile.createdAt,
            joinedAt,
            stats: {
                averageRating: userProfile.averageRating,
                ratingCount: userProfile.ratingCount,
                sessionsCompletedAsMentor: userProfile._count.sessionsAsMentor,
                sessionsCompletedAsMentee: userProfile._count.sessionsAsMentee,
            },
            skillsOffered: userProfile.skillsOffered,
            skillsWanted: userProfile.skillsWanted
        }

        await cacheSet(cacheKey, data, 600)
        return NextResponse.json({
            message: "User profile fetched successfully",
            data,
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

    const userId = getSessionFromRequest(req)

    console.log("PATCH /api/user/profile: userId from auth middleware:", userId);

    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const cacheKey = buildCacheKey("user", "profile", userId)

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
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

    console.log("PATCH /api/user/profile: Verifying user existence with userId:", userId);

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name : true
        },
    });

    console.log("PATCH /api/user/profile: Result of findUnique query:", existingUser);

    if (!existingUser) {
        return NextResponse.json({
            message: "User not found. Cannot update profile."
        }, {
            status: 404
        });
    }

    try {
        const { bio, name, skillsWanted, skillsOffered } = parsed.data

        const data: any = {}

        if (name !== undefined) data.name = name
        if (bio !== undefined) data.bio = bio

        if (skillsOffered) {
            const skillIds = await resolveSkills(skillsOffered);
            data.skillsOffered = {
                connect: skillIds.map((id) => ({ id }))
            }
        }

        if (skillsWanted) {
            const skillIds = await resolveSkills(skillsWanted);
            data.skillsWanted = {
                connect: skillIds.map((id) => ({ id })) 
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

        await cacheDelete(cacheKey)
        await cacheInvalidatePattern(`${CACHE_PREFIX}:search:users:*`)

        console.log(`Cache invalidated: ${cacheKey}`)
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