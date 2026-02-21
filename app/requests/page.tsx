"use client"

import RequestSidebarCard from '@/components/Request-Sidebar/RequestSidebarCard'
import { Separator } from '@/components/ui/separator';
import { receivedMentorshipRequests, sentMentorshipRequests } from '@/services/mentorship-request.service';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { DM_Sans } from "next/font/google"
import { useRouter } from 'next/navigation';


const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Request = {
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
    }
}

export default function RequestPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requests, setRequests] = useState<Request[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [mainFilter, setMainFilter] = useState<"received" | "sent">("received")
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")

    const router = useRouter()
    
    const handleStatusUpdate = (requestId: string) => {
        setRequests(prev => prev.filter(req => req.id !== requestId))
    }

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true)
                setError(null)

                let data;
                if (mainFilter === "received") {
                    data = await receivedMentorshipRequests()
                } else {
                    data = await sentMentorshipRequests(statusFilter === "all" ? undefined : statusFilter)
                }
                
                setRequests(data.data)
                setNextCursor(data.nextCursor)
            } catch (error: any) {
                const errorMessage =
                    error?.message || "Failed to load mentorship requests."
                setError(errorMessage)
                toast.error(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRequests()
    }, [mainFilter, statusFilter])
    
    return (
        <div className={`${DM_Sans_Font.className} pt-6 md:pt-8`}>

            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-semibold mb-4">
                    Mentorship Requests
                </h1>
            </div>

            <Separator className="w-full" />

            <div className="max-w-4xl mx-auto px-4 mt-6">
                
                {/* Main Filters: Sent / Received */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => {
                            setMainFilter("received")
                            setStatusFilter("all")
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                            mainFilter === "received"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Received
                    </button>
                    <button
                        onClick={() => {
                            setMainFilter("sent")
                            setStatusFilter("all")
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                            mainFilter === "sent"
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Sent
                    </button>
                </div>

                {/* Status Filters (only for Sent) */}
                {mainFilter === "sent" && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {["all", "pending", "accepted", "rejected"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                    statusFilter === status
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-4">
                    {isLoading && (
                        <p className="text-gray-500">Loading mentorship requests...</p>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800">{error}</p>
                            <p className="text-sm text-red-600 mt-1">
                                Check the browser console for more details.
                            </p>
                        </div>
                    )}

                    {!isLoading && !error && requests.length === 0 && (
                        <p className="flex justify-center align-middle text-gray-500 text-center">
                            No mentorship requests yet.
                        </p>
                    )}

                    {!isLoading && requests.map((request) => (
                        <RequestSidebarCard
                            key={request.id}
                            id={request.id}
                            title={request.title}
                            message={request.message}
                            createdAt={request.createdAt}
                            status={request.status}
                            mentee={request.mentee}
                            mentor={request.mentor}
                            skill={request.skill}
                            isSentView={mainFilter === "sent"}
                            onStatusUpdate={handleStatusUpdate}
                            onClick={() => {
                                router.push(`/requests/${request.id}`)
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
