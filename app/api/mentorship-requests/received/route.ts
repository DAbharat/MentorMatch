import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";


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

        return NextResponse.json({
            message: "Mentorship requests fetched successfully",
            data: formattedRequests,
            nextCursor
        }, {
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