"use client"

import NotificationCard from "@/components/notifications/NotificationCard"
import { FetchAllNotifications, deleteAllNotifications, markAllNotificationsAsRead } from "@/services/notification.service"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { DM_Sans } from "next/font/google"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/retroui/Button"
import { Trash2, CheckCheck, SlidersHorizontal } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup } from "radix-ui"

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
    }
}

export default function NotificationPage() {

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<"all" | "read" | "unread">("all")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await FetchAllNotifications({ limit: 10, filter })

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

    useEffect(() => {
        fetchNotifications()
    }, [filter])

    const handleMarkAllAsRead = async () => {
        try {
            setIsProcessing(true)
            await markAllNotificationsAsRead()
            toast.success("All notifications marked as read")
            await fetchNotifications()
        } catch (error: any) {
            toast.error(error.message || "Failed to mark notifications as read")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteAll = async () => {
        try {
            setIsProcessing(true)
            await deleteAllNotifications()
            toast.success("All notifications deleted")
            setNotifications([])
            setShowDeleteAllDialog(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to delete notifications")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleNotificationDeleted = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }

    const handleNotificationRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        ))
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className={`${DM_Sans_Font.className} pt-6 md:pt-8`}>

            {/* Centered Header */}
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">

                    {/* Title */}
                    <div className="flex justify-between items-center w-full sm:w-auto">
                        <div className="w-full">
                            {/* <h1 className="text-2xl font-semibold">
                                Notifications
                            </h1> */}
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    ({unreadCount} unread notifications)
                                </p>
                            )}
                        </div>

                        {/* Buttons (Mobile Only Right Aligned) */}
                        <div className="flex gap-2 sm:hidden">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="bg-transparent border border-[#1f1f1f] text-[#d3d3d3] hover:bg-transparent flex items-center gap-2 text-xs"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-44 p-2 border border-[#1f1f1f] bg-[#161a1d]">
                                    <div className="space-y-1">
                                        {["all", "unread", "read"].map((f) => {
                                            const isActive = filter === f
                                            return (
                                                <button
                                                    key={f}
                                                    onClick={() => setFilter(f as any)}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${isActive
                                                            ? "bg-black text-white"
                                                            : "hover:bg-gray-800 text-[#d3d3d3]"
                                                        }`}
                                                >
                                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={isProcessing || unreadCount === 0}
                                className="bg-transparent border border-[#1f1f1f] text-[#d3d3d3] hover:bg-transparent flex items-center gap-2 text-xs"
                            >
                                <CheckCheck className="w-4 h-4" />
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setShowDeleteAllDialog(true)}
                                disabled={isProcessing || notifications.length === 0}
                                className="bg-transparent border border-[#1f1f1f] text-red-500 hover:bg-transparent flex items-center gap-2 text-xs"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Buttons (Unchanged) */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className="bg-transparent border border-[#1f1f1f] text-[#d3d3d3] hover:bg-transparent flex items-center gap-2 text-xs sm:text-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span className="hidden xs:inline sm:inline">Filter</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-2 bg-[#161a1d] border border-[#1f1f1f]">
                                <div className="space-y-1">
                                    {["all", "unread", "read"].map((f) => {
                                        const isActive = filter === f
                                        return (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f as any)}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${isActive
                                                        ? "bg-black text-white"
                                                        : "hover:bg-gray-800 text-[#d3d3d3]"
                                                    }`}
                                            >
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </button>
                                        )
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={isProcessing || unreadCount === 0}
                            className="bg-transparent border border-[#1f1f1f] text-[#d3d3d3] hover:bg-transparent flex items-center gap-2 text-xs sm:text-sm"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span className="hidden xs:inline sm:inline">
                                Mark All Read
                            </span>
                            <span className="xs:hidden sm:hidden">Mark Read</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setShowDeleteAllDialog(true)}
                            disabled={isProcessing || notifications.length === 0}
                            className="bg-transparent border border-[#1f1f1f] text-red-500 hover:bg-transparent flex items-center gap-2 text-xs sm:text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden xs:inline sm:inline">
                                Delete All
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Full Width Separator */}
            {/* <Separator className="w-full" /> */}

            {/* Filters */}
            {/* <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="flex gap-2 mb-4">
                    {["all", "unread", "read"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                filter === f
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div> */}

            {/* Centered Content */}
            <div className="max-w-4xl mx-auto px-4 space-y-4">

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
                    <p className="text-gray-500 text-center py-8">
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
                        onDeleted={handleNotificationDeleted}
                        onRead={handleNotificationRead}
                    />
                ))}

            </div>

            {/* Delete All Confirmation Dialog */}
            <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all notifications?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your notifications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAll}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}