import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
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
        
        const whereClause: { userId: string, isRead?: boolean } = {
            userId: dbUserId
        }

        if(filter === "read") {
            whereClause.isRead = true
        } else if(filter === "unread") {
            whereClause.isRead = false
        }

        const [fetchNotifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
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
                    userId: dbUserId,
                    isRead: false
                }
            })
        ])


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
    const { userId } = await auth()

    if (!userId) {
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

        const deleteAllNotifications = await prisma.notification.deleteMany({
            where: {
                userId: dbUserId
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