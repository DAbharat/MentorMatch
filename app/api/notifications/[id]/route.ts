import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function DELETE(Req: NextRequest,
    { params } : { params : Promise<{ id : string }>}
) {

    const loggedInUserID = getSessionFromRequest(Req)
    if(!loggedInUserID) {
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
                id: loggedInUserID
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const deleteNotification = await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId: loggedInUserID
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