"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card';
import Link from 'next/link';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';
import { checkMentorshipSessionStatus } from '@/services/session.service';
import { Badge } from '../ui/badge';
import { deleteNotificationById, markSingleNotificationAsRead } from '@/services/notification.service';
import { toast } from 'sonner';
import { Trash2, Check, MoreVertical } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type NotificationCardProps = {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: string
        name: string
        clerkUserId: string
    };
    onDeleted?: (notificationId: string) => void;
    onRead?: (notificationId: string) => void;
}

export default function NotificationCard(
    { id, title, message, type, isRead, createdAt, sender, onDeleted, onRead }: NotificationCardProps
) {
    const router = useRouter()
    const senderName = sender?.name || "Unknown User"
    const showScheduleButton = type === "MENTORSHIP_REQUEST_ACCEPTED"
    
    const [sessionStatus, setSessionStatus] = useState<{
        hasSession: boolean
        status: string | null
    }>({ hasSession: false, status: null })
    const [checkingSession, setCheckingSession] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isMarkingRead, setIsMarkingRead] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    useEffect(() => {
        const checkSession = async () => {
            if (showScheduleButton && sender?.clerkUserId) {
                try {
                    const result = await checkMentorshipSessionStatus(sender.clerkUserId)
                    setSessionStatus(result)
                } catch (error) {
                    console.error("Error checking session status:", error)
                } finally {
                    setCheckingSession(false)
                }
            } else {
                setCheckingSession(false)
            }
        }

        checkSession()
    }, [showScheduleButton, sender?.clerkUserId])

    const handleScheduleSession = () => {
        if (sender?.clerkUserId) {
            router.push(`/sessions/schedule/${sender.clerkUserId}`)
        }
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteNotificationById(id)
            toast.success("Notification deleted")
            if (onDeleted) {
                onDeleted(id)
            }
            setShowDeleteDialog(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to delete notification")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleMarkAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isRead) return
        
        try {
            setIsMarkingRead(true)
            await markSingleNotificationAsRead(id)
            toast.success("Marked as read")
            if (onRead) {
                onRead(id)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to mark as read")
        } finally {
            setIsMarkingRead(false)
        }
    }

    const renderActionButton = () => {
        if (!showScheduleButton) return null
        
        if (checkingSession) {
            return <p className="text-xs text-gray-500">Checking session status...</p>
        }

        if (sessionStatus.hasSession) {
            const statusColors: Record<string, string> = {
                PENDING: "bg-yellow-100 text-yellow-800",
                CONFIRMED: "bg-blue-100 text-blue-800",
                IN_PROGRESS: "bg-green-100 text-green-800",
                COMPLETED: "bg-gray-100 text-gray-800",
                CANCELLED: "bg-red-100 text-red-800"
            }
            
            return (
                <Badge className={`${statusColors[sessionStatus.status || ''] || 'bg-gray-100 text-gray-800'} text-xs`}>
                    Session {sessionStatus.status?.toLowerCase() || 'created'}
                </Badge>
            )
        }

        return (
            <Button
                onClick={handleScheduleSession}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90"
            >
                Schedule Session
            </Button>
        )
    }

    return (
        <Card className={`bg-[#111315] p-4 w-full relative ${!isRead ? 'bg-blue-50/30 border-blue-200' : ''}`}>
            <div className="flex gap-4">

                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-lg font-semibold shadow-md">
                    {senderName?.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">

                    {/* Name + Timestamp + Actions row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {sender?.clerkUserId ? (
                                <Link href={`/profile/${sender.clerkUserId}`} onClick={(e) => e.stopPropagation()}>
                                    <span className="text-sm font-semibold truncate hover:underline text-[#d3d3d3]">{senderName}</span>
                                </Link>
                            ) : (
                                <span className="text-sm font-semibold truncate">{senderName}</span>
                            )}
                            {!isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(createdAt).toLocaleString()}</span>
                            
                            {/* Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                                        title="More options"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onClick={handleMarkAsRead}
                                        disabled={isMarkingRead || isRead}
                                    >
                                        <Check className="w-4 h-4 mr-2 text-green-600" />
                                        <span>Mark as read</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowDeleteDialog(true)
                                        }}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Title */}
                    {/* <h3 className="text-sm font-medium text-muted-foreground">{title}</h3> */}

                    {/* Message */}
                    <p className="text-sm text-gray-500 leading-relaxed">{message}</p>

                    {/* Action Button */}
                    <div className="mt-3">
                        {renderActionButton()}
                    </div>

                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete notification?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this notification.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}