"use client"

import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatCardProps = {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        clerkUserId: string;
    }
    createdAt: string;
    unreadCount?: number;
    isYourMessage?: boolean;
    isPinned?: boolean;
    onClick: () => void;
}

export default function ChatCard(
    { id, content, sender, createdAt, unreadCount = 0, isYourMessage = false, isPinned = false, onClick }: ChatCardProps
) {
    const formatRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Truncate message preview
    const truncateMessage = (text: string, maxLength: number = 35) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <Card
            className="bg-[#111315] cursor-pointer hover:bg-[#16181b] transition-colors p-4 border shadow-none border-[#1f1f1f]"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-base font-semibold shadow-sm overflow-hidden">
                        {sender.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Name + time row */}
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-sm text-[#e2e0f0] truncate">
                            {sender.name}
                        </h3>
                        <span className="text-[11px] text-[#6b6880] shrink-0 tabular-nums">
                            {formatRelativeTime(createdAt)}
                        </span>
                    </div>

                    {/* Message + badge row */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-[#6b6880] truncate">
                            {isYourMessage && (
                                <span className="text-muted-foreground font-semibold">You: </span>
                            )}
                            {truncateMessage(content)}
                        </p>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {unreadCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="rounded-full h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                                >
                                    {unreadCount}
                                </Badge>
                            )}

                            {isPinned && (
                                <div className="text-[#a78bfa]">
                                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}