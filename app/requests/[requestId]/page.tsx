"use client"

import RequestSidebarForm from '@/components/Request-Sidebar/RequestSidebarForm'
import { getMentorshipRequestById } from '@/services/mentorship-request.service'
import React, { useEffect, useState, use } from 'react'
import { toast } from 'sonner'
import { DM_Sans } from "next/font/google"
import { Separator } from '@/components/ui/separator'


const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type RequestId = {
    id: string
    title: string
    initialMessage: string
    mentee: {
        id: string
        name: string
        skillsOffered: { id: string; name: string }[]
        skillsWanted: { id: string; name: string }[]
    }
    skill: { id: string; name: string }
    createdAt: string
}

export default function RequestIdPage({ params }: { params: Promise<{ requestId: string }> }) {
    const { requestId } = use(params)
    const [request, setRequest] = useState<RequestId | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    // console.log("request: ", request)
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getMentorshipRequestById(requestId)
                toast.success("Mentorship request details of the user fetched successfully")
                setRequest(data.data)

            } catch (error: any) {
                console.error("Error fetching mentorship request:", error)
                toast.error(error?.message || "Failed to load mentorship request details.")
                setError(error?.message || "Failed to load mentorship request details.")
            } finally {
                setIsLoading(false)
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
        <div className={`${DM_Sans_Font.className} pt-6 md:pt-8`}>

            {/* Centered Header */}
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-semibold mb-4">
                    Request Details
                </h1>
            </div>

            {/* Full Width Separator */}
            <Separator className="w-full" />

            {/* Centered Content */}
            <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">

                {isLoading && (
                    <p className="text-gray-500">
                        Loading request...
                    </p>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                        <p className="text-sm text-red-600 mt-1">
                            Check the browser console for more details.
                        </p>
                    </div>
                )}

                <div>
                    <RequestSidebarForm
                        id={request.id}
                        title={request.title}
                        message={request.initialMessage}
                        mentee={request.mentee}
                        skill={request.skill}
                        createdAt={request.createdAt}
                    />
                </div>

            </div>
        </div>
    )
}
