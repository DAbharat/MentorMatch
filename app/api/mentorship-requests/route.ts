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
        const mentorId = searchParams.get("mentorId")
        const menteeId = searchParams.get("menteeId")
        const status = searchParams.get("status")

        if (!mentorId || !menteeId) {
            return NextResponse.json({
                message: "mentorId and menteeId are required"
            }, {
                status: 400
            })
        }

        const requests = await prisma.mentorshipRequest.findMany({
            where: {
                mentorId: mentorId,
                menteeId: menteeId,
                ...(status && { status: status as any })
            },
            include: {
                skill: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })

        return NextResponse.json({
            message: "Mentorship requests fetched successfully",
            requests
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
