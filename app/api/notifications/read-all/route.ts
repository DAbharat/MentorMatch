import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(request: NextRequest) {

    const userId = getSessionFromRequest(request)
    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "user not found."
            }, {
                status: 404
            })
        }
        
        const updateAllNotifications = await prisma.notification.updateMany({
            where: {
                userId,
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