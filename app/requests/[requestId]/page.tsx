"use client"

import RequestSidebarForm from '@/components/Request-Sidebar/RequestSidebarForm'
import { getMentorshipRequestById } from '@/services/mentorship-request.service'
import React, { useEffect, useState, use } from 'react'
import { toast } from 'sonner'

type RequestId = {
    id: string
    title: string
    initialMessage: string
    mentee: {
        id: string
        name: string
        clerkUserId: string
        skillsOffered: { id: string; name: string }[]
        skillsWanted: { id: string; name: string }[]
    }
    skill: { id: string; name: string }
    createdAt: string
}

export default function RequestIdPage({ params }: { params: Promise<{ requestId: string }> }) {
    const { requestId } = use(params)
    const [request, setRequest] = useState<RequestId | null>(null)

    console.log("request: ", request)
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await getMentorshipRequestById(requestId)
                toast.success("Mentorship request details of the user fetched successfully")
                setRequest(data.data)
            } catch (error: any) {
                console.error("Error fetching mentorship request:", error)
                toast.error(error?.message || "Failed to load mentorship request details.")
            }
        }
        fetchRequest()
    }, [requestId])

    if (!request) return (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground animate-pulse">
            Loading request...
        </div>
    )

    return (
        <div className="flex justify-center p-6">
            <RequestSidebarForm
                id={request.id}
                title={request.title}
                message={request.initialMessage}
                mentee={request.mentee}
                skill={request.skill}
                createdAt={request.createdAt}
            />
        </div>
    )
}