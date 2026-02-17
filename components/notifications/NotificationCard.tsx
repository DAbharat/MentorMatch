"use client"

import React from 'react'
import { Card } from '../ui/card';
import Link from 'next/link';

type NotificationCardProps = {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: string
        name: string
        clerkUserId: string
    }
}

export default function NotificationCard(
    { id, title, message, isRead, createdAt, sender }: NotificationCardProps
) {
    console.log("sender id and name: ",sender?.id, sender?.name)
    const senderName = sender?.name || "Unknown User"

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

                </div>
            </div>
        </Card>
    )
}