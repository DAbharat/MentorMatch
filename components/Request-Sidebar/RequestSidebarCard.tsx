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
    };
    mentor?: {
        id: string
        name: string
    };
    skill?: {
        id: string;
        name: string;
    };
    isSentView?: boolean;
    hasScheduledSession?: boolean;
    onStatusUpdate?: (requestId: string) => void;
    onClick?: () => void;
}

export default function RequestSidebarCard(
    { id, title, message, createdAt, status, mentee, mentor, skill, isSentView = false, hasScheduledSession = false, onStatusUpdate, onClick }: RequestSidebarProps
) {
    const [processingAction, setProcessingAction] = useState<"ACCEPT" | "REJECT" | null>(null)
    const router = useRouter()

    const handleAction = async (action: "ACCEPT" | "REJECT") => {
        try {
            setProcessingAction(action)
            await updateMentorshipRequestStatus(id, action)
            toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully`)
            if (onStatusUpdate) {
                onStatusUpdate(id)
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action.toLowerCase()} request`)
        } finally {
            setProcessingAction(null)
        }
    }

    const handleScheduleSession = () => {
        router.push(`/sessions/schedule/${mentor?.id}/${id}`)
    }

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            ACCEPTED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800"
        }
        return (
            <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} text-xs shrink-0`}>
                {status}
            </Badge>
        )
    }

    const displayUser = isSentView ? mentor : mentee
    const userName = displayUser?.name || "Unknown User"
    const userId = displayUser?.id

  return (
    <Card className="p-3 sm:p-4 w-full bg-[#161a1d] border-none">
        <div className="flex gap-3">

            {/* Avatar */}
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-base sm:text-lg font-semibold shadow-md">
                {userName.charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">

                {/* Name + Timestamp row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {/* Name + badge */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        {userId && (
                            <Link href={`/profile/${userId}`} onClick={(e) => e.stopPropagation()} className="min-w-0">
                                <span className="text-[#d3d3d3] text-sm font-semibold truncate hover:underline block">
                                    {userName}
                                </span>
                            </Link>
                        )}
                        {isSentView && status && getStatusBadge(status)}
                    </div>
                    {/* Timestamp — pushed to end but wraps naturally on small screens */}
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-auto">
                        {new Date(createdAt).toLocaleString()}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-muted-foreground text-sm font-medium leading-snug">{title}</h3>

                {/* Message */}
                <p className="text-sm text-gray-500 leading-relaxed wrap-break-word">{message}</p>

                {/* Action Buttons */}
                {!isSentView ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleAction("ACCEPT")
                            }}
                            disabled={processingAction !== null}
                            className="flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingAction === "ACCEPT" ? "Processing..." : "Accept"}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleAction("REJECT")
                            }}
                            disabled={processingAction !== null}
                            className="flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingAction === "REJECT" ? "Processing..." : "Reject"}
                        </button>
                    </div>
                ) : status === "ACCEPTED" && (
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!hasScheduledSession) {
                                    handleScheduleSession()
                                }
                            }}
                            disabled={hasScheduledSession}
                            title={hasScheduledSession ? "A session has already been scheduled for this mentorship" : ""}
                            className={`w-full sm:w-auto px-4 py-1.5 text-sm font-medium flex items-center justify-center gap-2 rounded-full transition ${
                                hasScheduledSession
                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                    : "bg-[#0f2f85] text-white hover:bg-[#0a2368]"
                            }`}
                        >
                            <Calendar className="w-4 h-4 shrink-0" />
                            {hasScheduledSession ? "Session Already Scheduled" : "Schedule a Session"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    </Card>
  )
}