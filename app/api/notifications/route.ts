import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const userId = getSessionFromRequest(request)

    if (!userId) {
        console.log("Unauthenticated request to /api/notifications")
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const { searchParams } = new URL(request.url)
        const rawLimit = Number(searchParams.get("limit"))
        const limit = !rawLimit || rawLimit <= 0 ? 10 : Math.min(rawLimit, 50)
        const filter = searchParams.get("filter")
        const cursor = searchParams.get("cursor")
        let nextCursor: string | null = null

        console.log("Fetching notifications for userId:", userId, "params:", { limit, filter, cursor })
        
        const totalNotifications = await prisma.notification.count({
            where: {
                userId
            }
        })
        console.log("Total notifications in database for this user:", totalNotifications)
        
        const whereClause: { userId: string, isRead?: boolean } = {
            userId
        }

        if(filter === "read") {
            whereClause.isRead = true
        } else if(filter === "unread") {
            whereClause.isRead = false
        }

        console.log("Query where clause:", JSON.stringify(whereClause))

        const [fetchNotifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
                take: limit + 1,
                ...(cursor && {
                    skip: 1,
                    cursor: { id: cursor }
                }),
                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            })
        ])

        console.log("Fetched notifications count:", fetchNotifications.length, "unreadCount:", unreadCount)

        if (fetchNotifications.length > limit) {
            const nextItem = fetchNotifications.pop()
            nextCursor = nextItem!.id
        }

        return NextResponse.json({
            message: "Notifications fetched successfully",
            notifications: fetchNotifications,
            unreadCount,
            nextCursor
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}

export async function DELETE(request: NextRequest) {
    const userId = getSessionFromRequest(request)

    if (!userId) {
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
                message: "User not found."
            }, {
                status: 404
            })
        }

        const deleteAllNotifications = await prisma.notification.deleteMany({
            where: {
                userId
            }
        })
        if (deleteAllNotifications.count === 0) {
            return NextResponse.json({
                message: "No notifications to delete"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            message: `${deleteAllNotifications.count} notifications deleted successfully`
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error deleting notifications:", error)
        return NextResponse.json({
            message: "An error occurred while deleting notifications"
        }, {
            status: 500
        })
    }
}