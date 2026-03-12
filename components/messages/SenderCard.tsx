"use client"

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type SenderCardProps = {
    id: string;
    content: string;
    createdAt: string;
    isRead?: boolean;
    isDelivered?: boolean;
}

export default function SenderCard(
    { id, content, createdAt, isRead = false, isDelivered = true } : SenderCardProps 
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
    <div className="flex items-start justify-end w-full">
      {/* Message Content */}
      <div className="flex flex-col items-end min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-2xl">
        {/* Message bubble */}
        <div
          className="rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-2.5 inline-flex items-end gap-1.5 sm:gap-2 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
            color: '#f5f3ff',
          }}
        >
          <p className="text-xs sm:text-sm md:text-base wrap-break-word whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
          
          {/* Timestamp and status indicators */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 self-end">
            <span
              className="text-[10px] sm:text-xs whitespace-nowrap"
              style={{ color: '#c4b5fd', opacity: 0.9 }}
            >
              {formatTime(createdAt)}
            </span>
            
            {/* Read/Delivered status */}
            <div className="flex items-center -space-x-0.5 sm:-space-x-1">
              {isDelivered && (
                <Check
                  className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5")}
                  style={{ color: isRead ? '#c4b5fd' : '#a78bfa', opacity: isRead ? 1 : 0.7 }}
                  strokeWidth={2.5}
                />
              )}
              {isRead && (
                <Check
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  style={{ color: '#c4b5fd' }}
                  strokeWidth={2.5}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}