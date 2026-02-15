import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!dbUser) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const dbUserId = dbUser.id

        const updateAllNotifications = await prisma.notification.updateMany({
            where: {
                userId: dbUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        })

        return NextResponse.json({
            message: `${updateAllNotifications.count} notifications marked as read`
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json({
            message: "An error occurred while marking notifications as read"
        }, {
            status: 500
        })
    }
}