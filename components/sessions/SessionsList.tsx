"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/retroui/Button"
import Link from "next/link"
import { DM_Sans } from "next/font/google"
import { MessageCircleMore } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { fetchAllChatsForAUser } from "@/services/messages.service"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Session = {
    id: string
    status: string
    scheduledAt: string
    totalCallDuration: number
    mentor: {
        id: string
        name: string
        clerkUserId: string
    }
    mentee: {
        id: string
        name: string
        clerkUserId: string
    }
    skill: {
        id: string
        name: string
    }
}

type SessionsListProps = {
    sessions: Session[]
    currentUserClerkId: string | null
    loading: boolean
    onConfirm: (sessionId: string) => void
    onCancel: (sessionId: string) => void
}

export default function SessionsList({ sessions, currentUserClerkId, loading, onConfirm, onCancel }: SessionsListProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all")
    const [navigatingToChatId, setNavigatingToChatId] = useState<string | null>(null)

    const filteredSessions = sessions.filter((session) => {
        if (filter === "all") return true
        return session.status.toLowerCase() === filter
    })

    const handleNavigateToChat = async (session: Session) => {
        setNavigatingToChatId(session.id)
        try {
            const response = await fetchAllChatsForAUser()
            const chats = response.chats || []
            
            const matchingChat = chats.find((chat: any) => 
                chat.mentor.id === session.mentor.id && 
                chat.mentee.id === session.mentee.id &&
                chat.skill?.id === session.skill.id
            )
            
            if (matchingChat) {
                router.push(`/chats/${matchingChat.id}`)
            } else {
                toast.error("Chat not found. The mentorship may not be active yet.")
            }
        } catch (error) {
            console.error("Error finding chat:", error)
            toast.error("Failed to open chat")
        } finally {
            setNavigatingToChatId(null)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            CONFIRMED: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-green-100 text-green-800",
            COMPLETED: "bg-gray-100 text-gray-800",
            CANCELLED: "bg-red-100 text-red-800"
        }
        return colors[status] || "bg-gray-100 text-gray-800"
    }

    const isMentor = (session: Session) => session.mentor.clerkUserId === currentUserClerkId
    const isMentee = (session: Session) => session.mentee.clerkUserId === currentUserClerkId

    return (
        <div className={`${DM_Sans_Font.className} container max-w-4xl mx-auto px-4 py-8`}>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Sessions</h1>
                </div>

                <Separator className="w-full" />

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "confirmed", "completed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${filter === f
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {loading && (
                        <p className="text-center text-muted-foreground py-8">
                            Loading sessions...
                        </p>
                    )}

                    {!loading && filteredSessions.length === 0 && (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No sessions found</p>
                        </Card>
                    )}

                    {!loading && filteredSessions.map((session) => (
                        <Card key={session.id} className="p-6">
                            <div className="space-y-4">

                                {/* Header Row */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">
                                                {session.skill.name}
                                            </h3>
                                            <Badge className={getStatusColor(session.status)}>
                                                {session.status}
                                            </Badge>
                                        </div>
                                        {isMentor(session) ? (
                                            <p className="text-sm text-muted-foreground">
                                                with {session.mentee.name}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                with {session.mentor.name}
                                            </p>
                                        )}

                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Scheduled</p>
                                        <p className="font-medium">
                                            {new Date(session.scheduledAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium">{session.totalCallDuration} minutes</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {session.status === "PENDING" && currentUserClerkId === session.mentor.clerkUserId && (
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={() => onConfirm(session.id)}
                                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            onClick={() => onCancel(session.id)}
                                            className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                {session.status === "PENDING" && currentUserClerkId === session.mentee.clerkUserId && (
                                    <div className="pt-2">
                                        <p className="text-sm text-center text-muted-foreground py-2">
                                            Waiting for mentor confirmation
                                        </p>
                                    </div>
                                )}

                                {session.status === "CONFIRMED" && (
                                    <div className="pt-2">
                                        <Button 
                                            className="w-full bg-white text-black hover:bg-gray-200 border border-black rounded-2xl"
                                            onClick={() => handleNavigateToChat(session)}
                                            disabled={navigatingToChatId === session.id}
                                        >
                                            <MessageCircleMore className="mr-2 text-sm size-4" />
                                            {navigatingToChatId === session.id ? "Opening..." : "Message"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
