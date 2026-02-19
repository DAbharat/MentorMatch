"use client"

import React from 'react'
import { Card } from '../ui/card';
import Link from 'next/link';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';

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
    }
}

export default function NotificationCard(
    { id, title, message, type, isRead, createdAt, sender }: NotificationCardProps
) {
    const router = useRouter()
    const senderName = sender?.name || "Unknown User"
    const showScheduleButton = type === "MENTORSHIP_REQUEST_ACCEPTED"

    const handleScheduleSession = () => {
        if (sender?.clerkUserId) {
            router.push(`/sessions/schedule/${sender.clerkUserId}`)
        }
    }

    return (
        <Card className="p-4 w-full cursor-pointer">
            <div className="flex gap-4">

                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-lg font-semibold shadow-md">
                    {senderName?.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">

                    {/* Name + Timestamp row */}
                    <div className="flex items-center justify-between gap-4">
                        <Link href={`/profile/${sender?.clerkUserId}`}><span className="text-sm font-semibold truncate hover:underline">{senderName}</span></Link>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(createdAt).toLocaleString()}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-medium">{title}</h3>

                    {/* Message */}
                    <p className="text-sm text-gray-500 leading-relaxed">{message}</p>

                    {/* Action Button */}
                    {showScheduleButton && (
                        <div className="mt-3">
                            <Button
                                onClick={handleScheduleSession}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90"
                            >
                                Schedule Session
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </Card>
    )
}