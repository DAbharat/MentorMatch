"use client"

import NotificationCard from "@/components/notifications/NotificationCard"
import { FetchAllNotifications } from "@/services/notification.service"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { DM_Sans } from "next/font/google"
import { Separator } from "@/components/ui/separator"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Notification = {
    id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
    sender?: {
        id: string
        name: string
        clerkUserId: string
    }
}

export default function NotificationPage() {

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await FetchAllNotifications({ limit: 10 })

                setNotifications(data.notifications)
                setNextCursor(data.nextCursor)

            } catch (error: any) {
                const errorMessage =
                    error?.message || "Failed to load notifications."
                setError(errorMessage)
                toast.error(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])

    return (
        <div className={`${DM_Sans_Font.className} mt-24`}>

            {/* Centered Header */}
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-semibold mb-4">
                    Notifications
                </h1>
            </div>

            {/* Full Width Separator */}
            <Separator className="w-full" />

            {/* Centered Content */}
            <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">

                {loading && (
                    <p className="text-gray-500">
                        Loading notifications...
                    </p>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                        <p className="text-sm text-red-600 mt-1">
                            Check the browser console for more details.
                        </p>
                    </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                    <p className="text-gray-500">
                        No notifications yet.
                    </p>
                )}

                {!loading && notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        id={notification.id}
                        title={notification.title}
                        message={notification.message}
                        type={notification.type}
                        isRead={notification.isRead}
                        createdAt={notification.createdAt}
                        sender={notification.sender}
                    />
                ))}

            </div>
        </div>
    )
}
