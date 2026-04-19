"use client"

import React from 'react'
import { Video, ArrowLeft } from 'lucide-react'
import SenderCard from '@/components/messages/SenderCard'
import ReceiverCard from '@/components/messages/ReceiverCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

type Message = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender?: {
        id: string;
        name: string;
    };
    category?: string;
    isRead?: boolean;
    isDelivered?: boolean;
}

type ChatRoomProps = {
    roomName: string;
    lastSeen: string;
    messages: Message[];
    currentUserId: string;
    otherUserId: string;
    onVideoCall?: () => void;
    onBack?: () => void;
}

export default function ChatRoom({
    roomName,
    lastSeen,
    messages = [],
    currentUserId,
    otherUserId,
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
        <div className="flex flex-col h-full w-full bg-[#0b090a] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#1e1c1e] bg-[#0b090a] shrink-0">
                {/* Left: Back button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9 hover:bg-[#1a1a2e] transition-colors"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#b0aec0' }} />
                </Button>

                {/* Center: Avatar + Room info */}
                <div className="flex items-center gap-2 sm:gap-3 justify-center flex-1">
                    <div
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-[#d3d3d3] rounded-full sm:rounded-xl flex items-center justify-center shrink-0"
                        
                    >
                        <span className="text-[10px] sm:text-xs font-semibold text-black tracking-wide">
                            {initials}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        {otherUserId ? (
                            <Link 
                                href={`/profile/${otherUserId}`}
                                className="font-semibold text-xs sm:text-sm leading-tight truncate transition-colors"
                                style={{ color: '#e2e0f0' }}
                            >
                                {roomName}
                            </Link>
                        ) : (
                            <h2
                                className="font-semibold text-xs sm:text-sm leading-tight truncate"
                                style={{ color: '#e2e0f0' }}
                            >
                                {roomName}
                            </h2>
                        )}
                        <p
                            className="text-[10px] sm:text-xs leading-tight truncate mt-0.5"
                            style={{ color: '#6b6880' }}
                        >
                            {lastSeen}
                        </p>
                    </div>
                </div>

                {/* Right: Video call button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-lg sm:rounded-xl h-8 w-8 sm:h-9 sm:w-9 hover:bg-[#1a1a2e] transition-colors"
                    onClick={onVideoCall}
                >
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#b0aec0' }} />
                </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
                {Object.entries(groupedMessages).length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs sm:text-sm" style={{ color: '#6b6880' }}>No messages yet</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="space-y-2.5 sm:space-y-3">
                            {/* Date separator */}
                            <div className="flex items-center justify-center gap-2 sm:gap-3 my-4 sm:my-6">
                                <Separator className="flex-1" style={{ backgroundColor: '#1e1c2e' }} />
                                <span
                                    className="text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap"
                                    style={{
                                        color: '#9d9ab0',
                                        background: '#1a1828',
                                        border: '1px solid #2a2740',
                                    }}
                                >
                                    {date}
                                </span>
                                <Separator className="flex-1" style={{ backgroundColor: '#1e1c2e' }} />
                            </div>

                            {/* Messages for this date */}
                            <div className="space-y-2 sm:space-y-3">
                                {dateMessages.map((message) => {
                                    const isSender = message.sender?.id === currentUserId;

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