import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
        return NextResponse.json({
            message: "Bad Request: User ID is required in the URL"
        }, {
            status: 400
        });
    }

    try {
        const fetchUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            },
            select: {
                id: true,
                name: true,
                bio: true,
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
                averageRating: true,
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
                createdAt: true,
            }
        })

        if(!fetchUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            });
        }

        const options = {
            year: "numeric",
            month: "short"
        } as const

        const joinedAt = new Date(fetchUser.createdAt).toLocaleDateString("en-US", options);

        const data = {
            ...fetchUser,
            // skillsOffered: fetchUser.skillsOffered.map(s => s.name),
            // skillsWanted: fetchUser.skillsWanted.map(s => s.name),
            joinedAt,
            sessionsCompletedAsMentor: fetchUser._count.sessionsAsMentor,
            sessionsCompletedAsMentee: fetchUser._count.sessionsAsMentee,
        }

        return NextResponse.json({
            message: "User fetched successfully",
            data
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}