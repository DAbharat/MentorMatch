"use client"

import React, { useState } from 'react'
import { Card } from '../ui/card';
import Link from 'next/link';
import { updateMentorshipRequestStatus } from '@/services/mentorship-request.service';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

type RequestSidebarProps = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    status?: string;
    mentee?: {
        id: string
        name: string
        clerkUserId: string
    };
    mentor?: {
        id: string
        name: string
        clerkUserId: string
    };
    skill?: {
        id: string;
        name: string;
    };
    isSentView?: boolean;
    onStatusUpdate?: (requestId: string) => void;
    onClick?: () => void;
}

export default function RequestSidebarCard(
    { id, title, message, createdAt, status, mentee, mentor, skill, isSentView = false, onStatusUpdate, onClick }: RequestSidebarProps
) {
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

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

    const handleScheduleSession = () => {
        router.push('/sessions/schedule')
    }

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            ACCEPTED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800"
        }
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} text-xs`}>
                {status}
            </Badge>
        )
    }

    const displayUser = isSentView ? mentor : mentee
    const userName = displayUser?.name || "Unknown User"
    const userClerkId = displayUser?.clerkUserId

  return (
    <Card className="p-4 w-full">
        <div className="flex gap-4">

            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-lg font-semibold shadow-md">
                {userName.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">

                {/* Name + Timestamp + Status row */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {userClerkId && (
                            <Link href={`/profile/${userClerkId}`} onClick={(e) => e.stopPropagation()}>
                                <span className="text-sm font-semibold truncate hover:underline">
                                    {userName}
                                </span>
                            </Link>
                        )}
                        {isSentView && status && getStatusBadge(status)}
                    </div>
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
                        {isSentView ? `Requested to learn: ${skill.name}` : `Wants to learn: ${skill.name}`}
                    </span>
                )}

                {/* Action Buttons */}
                {!isSentView ? (
                    <div className="flex gap-3 pt-1">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation()
                                handleAction("ACCEPT")
                            }}
                            disabled={isProcessing}
                            className="px-4 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Accept"}
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation()
                                handleAction("REJECT")
                            }}
                            disabled={isProcessing}
                            className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Reject"}
                        </button>
                    </div>
                ) : status === "ACCEPTED" && (
                    <div className="flex gap-3 pt-1">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation()
                                handleScheduleSession()
                            }}
                            className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule a Session
                        </button>
                    </div>
                )}

            </div>
        </div>
    </Card>
  )
}