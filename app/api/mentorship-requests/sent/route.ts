import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/auth";
import { getCachedRequests, setCachedRequests } from "@/redis/cache/mentorship-requests";

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
        const statusFilter = searchParams.get("status") // "all", "pending", "accepted", "rejected"
        let nextCursor: string | null = null

        const cached = await getCachedRequests(userId, "sent")
        if(cached) {
            return NextResponse.json(
                cached, 
            {
                status: 200
            })
        }

        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "User not found"
            })
        }

        const whereClause: any = {
            menteeId: userId,
        }

        if (statusFilter && statusFilter !== "all") {
            whereClause.status = statusFilter.toUpperCase()
        }

        const fetchRequests = await prisma.mentorshipRequest.findMany({
            where: whereClause,
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
            status: req.status,
            mentor: req.mentor,
            mentee: req.mentee,
            skill: req.skill
        }))

        const responseData = {
            message: "Sent mentorship requests fetched successfully",
            data: formattedRequests,
            nextCursor
        }
        await setCachedRequests(userId, "sent", responseData)

        return NextResponse.json(
            responseData, 
        {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching sent mentorship requests:", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}
