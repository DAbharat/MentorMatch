import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(Req: NextRequest,
    { params } : { params : { id : string }}
) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }
    
    const { id } = params

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

        const deleteNotification = await prisma.notification.deleteMany({
            where: {
                id: id,
                userId: dbUserId
            }
        })

        if(deleteNotification.count === 0) {
            return NextResponse.json({
                message: "Notification not found"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            message: "Notification deleted successfully"
        }, {
            status: 200
        })
        
    } catch (error) {
        console.error("Error deleting notification:", error)
        return NextResponse.json({
            message: "An error occurred while deleting the notification"
        }, {
            status: 500
        })
    }
}