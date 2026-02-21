"use client"

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ReceiverCardProps = {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        clerkUserId: string;
    };
    createdAt: string;
    category?: string;
}

export default function ReceiverCard(
    { id, content, sender, createdAt, category } : ReceiverCardProps 
) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex items-start gap-2 sm:gap-3 w-full max-w-[85%] sm:max-w-[75%] md:max-w-2xl">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-md">
          {sender.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header with name and badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
          <Link 
            href={`/profile/${sender.clerkUserId}`}
            className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate hover:text-primary transition-colors hover:underline"
          >
            {sender.name}
          </Link>
          {category && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
              {category}
            </Badge>
          )}
        </div>

        {/* Message bubble */}
        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-2.5 inline-block">
          <p className="text-xs sm:text-sm md:text-base text-foreground wrap-break-word whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Timestamp */}
        <div className="mt-0.5 sm:mt-1 ml-1">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

