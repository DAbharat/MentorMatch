import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(request: NextRequest,
    { params } : { params : Promise<{ id: string }> }
) {

    const userId = getSessionFromRequest(request)
    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    const { id: notificationId } = await params

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "User not found."
            }, {
                status: 404
            })
        }

        const markAsRead = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        })
        if(markAsRead.count === 0) {
            return NextResponse.json({
                message: "Notification not found or already read"
            }, {
                status: 404
            })
        }

        const updatedNotification = await prisma.notification.findUnique({
            where: {
                id: notificationId
            },
            select: {
                id: true,
                type: true, 
                title: true,
                message: true,
                isRead: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            message: "Notification marked as read",
            notification: updatedNotification
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}