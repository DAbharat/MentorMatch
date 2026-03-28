import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const searchName = url.searchParams.get("name")?.trim()
    const searchSkill = url.searchParams.get("skill")?.trim()

    if (!searchName && !searchSkill) {
        return NextResponse.json({
            message: "Bad Request: 'name' or 'search' query parameter is required"
        }, {
            status: 400
        })
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get("limit")) || 10
        const cursor = searchParams.get("cursor")
        let nextCursor: string | null = null

        const whereClause: any = searchName || searchSkill ? { 
            OR: []
        } : {};

        if (searchName) {
            if (searchName.length < 3 || searchName.length > 50) {
                return NextResponse.json({
                    message: "Name must be between 3 and 50 characters"
                }, {
                    status: 400
                });
            }
            whereClause.OR.push({
                name: {
                    contains: searchName,
                    mode: "insensitive"
                }
            });
        }

        if (searchSkill) {
            whereClause.OR.push({
                skillsOffered: {
                    some: {
                        normalizedSkillName: {
                            contains: searchSkill,
                            mode: "insensitive"
                        }
                    }
                }
            });
        }

        const searchUsers = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                clerkUserId: true,
                name: true,
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
                }
            },
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor
                }
            }),
            orderBy: {
                averageRating: {
                    sort: "desc",
                    nulls: "last"
                }
            }
        })

        if(searchUsers.length > limit) {
            const nextUsers = searchUsers.pop()
            nextCursor = nextUsers!.id
        }

        const data = searchUsers.map(u => ({
            id: u.id,
            clerkUserId: u.clerkUserId,
            name: u.name,
            skillsOffered: u.skillsOffered.map(s => s.name),
            skillsWanted: u.skillsWanted.map(s => s.name),
            averageRating: u.averageRating,
            completedSessions: u._count.sessionsAsMentor + u._count.sessionsAsMentee
        }));

        return NextResponse.json({
            message: "Users fetched successfully",
            count: searchUsers.length,
            data,
            pagination: {
                nextCursor
            }
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error searching users by name:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }

}