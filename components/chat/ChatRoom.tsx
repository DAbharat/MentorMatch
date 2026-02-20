"use client"

import React from 'react'
import { Video, ArrowLeft } from 'lucide-react'
import SenderCard from '@/components/messages/SenderCard'
import ReceiverCard from '@/components/messages/ReceiverCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type Message = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender?: {
        id: string;
        name: string;
        clerkUserId: string;
    };
    category?: string;
    isRead?: boolean;
    isDelivered?: boolean;
}

type ChatRoomProps = {
    roomName?: string;
    lastSeen?: string;
    messages?: Message[];
    currentUserId?: string;
    onVideoCall?: () => void;
    onBack?: () => void;
}

export default function ChatRoom({
    roomName = "Team Unicorns",
    lastSeen = "last seen 41 minutes ago",
    messages = [],
    currentUserId = "current-user",
    onVideoCall,
    onBack
}: ChatRoomProps) {

    // Format date for separator
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, message) => {
        const date = formatDate(message.createdAt);
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(message);
        return acc;
    }, {} as Record<string, Message[]>);

    // Generate initials from room name
    const initials = roomName
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b bg-card/50 shrink-0">
                {/* Left: Back button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>

                {/* Center: Avatar + Room info */}
                <div className="flex items-center gap-2 sm:gap-3 justify-center flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] sm:text-xs font-semibold text-primary tracking-wide">
                            {initials}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h2 className="font-semibold text-xs sm:text-sm text-foreground leading-tight truncate">
                            {roomName}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">{lastSeen}</p>
                    </div>
                </div>

                {/* Right: Video call button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9"
                    onClick={onVideoCall}
                >
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
                {Object.entries(groupedMessages).length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs sm:text-sm text-muted-foreground">No messages yet</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="space-y-2.5 sm:space-y-3">
                            {/* Date separator */}
                            <div className="flex items-center justify-center gap-2 sm:gap-3 my-4 sm:my-6">
                                <Separator className="flex-1" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium px-2 sm:px-3 py-0.5 sm:py-1 bg-muted rounded-full whitespace-nowrap">
                                    {date}
                                </span>
                                <Separator className="flex-1" />
                            </div>

                            {/* Messages for this date */}
                            <div className="space-y-2 sm:space-y-3">
                                {dateMessages.map((message) => {
                                    const isSender = message.senderId === currentUserId;

                                    return isSender ? (
                                        <SenderCard
                                            key={message.id}
                                            id={message.id}
                                            content={message.content}
                                            createdAt={message.createdAt}
                                            isRead={message.isRead}
                                            isDelivered={message.isDelivered}
                                        />
                                    ) : (
                                        <ReceiverCard
                                            key={message.id}
                                            id={message.id}
                                            content={message.content}
                                            sender={message.sender!}
                                            createdAt={message.createdAt}
                                            category={message.category}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}