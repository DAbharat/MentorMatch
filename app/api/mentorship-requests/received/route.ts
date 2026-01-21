import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function GET(req: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({
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

        const fetchRequests = await prisma.mentorshipRequest.findMany({
            where: {
                mentorId: userId,
                status: "PENDING"
            },
            include: {
                mentee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
            const nextItem = fetchRequests.pop(); // remove extra item
            nextCursor = nextItem!.id;
        }

        return Response.json({
            message: "Mentorship requests fetched successfully",
            data: fetchRequests,
            nextCursor
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error fetching mentorship requests:", error)
        return Response.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}