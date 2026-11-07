import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/auth";
import { cacheGet } from "@/lib/redis/cache";
import { getCachedRequests, setCachedRequests } from "@/lib/redis/cache/mentorship-requests";


export async function GET(req: NextRequest) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const { searchParams } = req.nextUrl
        const limit = Number(searchParams.get("limit")) || 10
        const cursor = searchParams.get("cursor")
        let nextCursor: string | null = null

        const cached = await getCachedRequests(userId, "received")
        if (cached) {
            return NextResponse.json(
                cached, 
            {
                status: 200
            });
        }

        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userId) {
            return NextResponse.json({
                message: "user not found"
            }, {
                status: 404
            })
        }

        const fetchRequests = await prisma.mentorshipRequest.findMany({
            where: {
                mentorId: userId,
                status: "PENDING"
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                skill: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit + 1,
            ...(cursor && {
                cursor: {
                    id: cursor,
                },
                skip: 1,
            })
        })

        if (fetchRequests.length > limit) {
            const nextItem = fetchRequests.pop(); 
            nextCursor = nextItem!.id;
        }

        const formattedRequests = fetchRequests.map(req => ({
            id: req.id,
            title: `Mentorship Request for ${req.skill.name}`,
            message: req.initialMessage || "No message provided",
            createdAt: req.createdAt,
            mentor: req.mentor,
            mentee: req.mentee,
            skill: req.skill
        }))

        const responseData = {
            message: "Mentorship requests fetched successfully",
            data: formattedRequests,
            nextCursor
        }

        await setCachedRequests(userId, "received", responseData)

        return NextResponse.json(
            responseData, 
        {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching mentorship requests:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}