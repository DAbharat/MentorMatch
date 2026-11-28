"use client"

import RequestSidebarForm from '@/components/Request-Sidebar/RequestSidebarForm'
import { getMentorshipRequestById } from '@/services/mentorship-request.service'
import React, { useEffect, useState, use } from 'react'
import { DM_Sans } from "next/font/google"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


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
    const [retryCount, setRetryCount] = useState(0)


    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getMentorshipRequestById(requestId)
                setRequest(data.data)

            } catch (error: unknown) {
                console.error("Error fetching mentorship request:", error)
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load mentorship request details."
                )
            } finally {
                setIsLoading(false)
            }
        }
        void fetchRequest()
    }, [requestId, retryCount])

    if (isLoading) return (
        <div className={`${DM_Sans_Font.className} flex min-h-40 items-center justify-center bg-[#090a08] px-4`} role="status" aria-live="polite">
            <p className="text-sm text-[#a8ab9e]">Loading request details...</p>
        </div>
    )

    if (error) return (
        <main className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] px-4 py-10`}>
            <section className="mx-auto max-w-3xl rounded-2xl border border-[#61282d] bg-[#231214] p-5 sm:p-6" role="alert">
                <h1 className="text-lg font-semibold text-[#f4b8bc]">Request details could not be loaded</h1>
                <p className="mt-2 text-sm leading-relaxed text-[#f4b8bc]">{error}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                        type="button"
                        onClick={() => setRetryCount((count) => count + 1)}
                        className="h-11 cursor-pointer rounded-xl bg-[#8fa654] px-4 font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                    >
                        Try again
                    </Button>
                    <Button asChild variant="outline" className="h-11 cursor-pointer rounded-xl border-[#3a4530] bg-[#0d0f0b] px-4 text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#8fa654]">
                        <Link href="/requests">Back to requests</Link>
                    </Button>
                </div>
            </section>
        </main>
    )

    if (!request) return (
        <main className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] px-4 py-10`}>
            <section className="mx-auto max-w-3xl rounded-2xl border border-[#242a1e] bg-[#11140e] p-5 sm:p-6">
                <h1 className="text-lg font-semibold text-[#f2f0e8]">Request not found</h1>
                <p className="mt-2 text-sm text-[#a8ab9e]">This request may have been removed or is no longer available.</p>
                <Button asChild variant="outline" className="mt-5 h-11 cursor-pointer rounded-xl border-[#3a4530] bg-[#0d0f0b] px-4 text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#8fa654]">
                    <Link href="/requests">Back to requests</Link>
                </Button>
            </section>
        </main>
    )

    return (
        <main className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] pt-6 md:pt-8`}>

            {/* Centered Header */}
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-semibold mb-4">
                    Request Details
                </h1>
            </div>

            {/* Full Width Separator */}
            <Separator className="w-full bg-[#242a1e]" />

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
        </main>
    )
}
