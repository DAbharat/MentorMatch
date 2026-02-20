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
    // Format time to relative format (e.g., "20m", "2h", "1d")
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
    const truncateMessage = (text: string, maxLength: number = 30) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors p-4 border-0 shadow-none"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xl font-semibold shadow-sm overflow-hidden">
                        {sender.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base text-foreground truncate">
                            {sender.name}
                        </h3>
                        <span className="text-sm text-muted-foreground shrink-0">
                            {formatRelativeTime(createdAt)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                            {isYourMessage && <span className="text-primary font-medium">You: </span>}
                            {truncateMessage(content)}
                        </p>
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-2 shrink-0">
                    {unreadCount > 0 && (
                        <Badge 
                            variant="default" 
                            className="rounded-full h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                    {isPinned && (
                        <div className="text-primary">
                            <Bookmark className="w-5 h-5 fill-current" />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

