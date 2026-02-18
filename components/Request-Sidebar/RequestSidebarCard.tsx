"use client"

import React, { useState } from 'react'
import { Card } from '../ui/card';
import Link from 'next/link';
import { updateMentorshipRequestStatus } from '@/services/mentorship-request.service';
import { toast } from 'sonner';

type RequestSidebarProps = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    mentee?: {
        id: string
        name: string
        clerkUserId: string
    };
    skill?: {
        id: string;
        name: string;
    };
    onStatusUpdate?: (requestId: string) => void;
    onClick?: () => void;
}

export default function RequestSidebarCard(
    { id, title, message, createdAt, mentee, skill, onStatusUpdate, onClick }: RequestSidebarProps
) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleAction = async (action: "ACCEPT" | "REJECT") => {
        try {
            setIsProcessing(true)
            await updateMentorshipRequestStatus(id, action)
            toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully`)
            if (onStatusUpdate) {
                onStatusUpdate(id)
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action.toLowerCase()} request`)
        } finally {
            setIsProcessing(false)
        }
    }

  return (
    <Card className="p-4 w-full cursor-pointer" onClick={onClick}>
        <div className="flex gap-4">

            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-lg font-semibold shadow-md">
                {mentee?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">

                {/* Name + Timestamp row */}
                <div className="flex items-center justify-between gap-4">
                    <Link href={`/profile/${mentee?.clerkUserId}`}>
                        <span className="text-sm font-semibold truncate hover:underline">
                            {mentee?.name}
                        </span>
                    </Link>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(createdAt).toLocaleString()}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium">{title}</h3>

                {/* Message */}
                <p className="text-sm text-gray-500 leading-relaxed">{message}</p>

                {/* Skill */}
                {skill && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-md">
                        Wants to learn: {skill.name}
                    </span>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                    <button 
                        onClick={() => handleAction("ACCEPT")}
                        disabled={isProcessing}
                        className="px-4 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : "Accept"}
                    </button>
                    <button 
                        onClick={() => handleAction("REJECT")}
                        disabled={isProcessing}
                        className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : "Reject"}
                    </button>
                </div>

            </div>
        </div>
    </Card>
  )
}