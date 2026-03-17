"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import SessionsList from "@/components/sessions/SessionsList"
import { fetchAllSessions, confirmSession, cancelSession, startSession } from "@/services/session.service"
import { fetchMyProfile } from "@/services/profile.service"

type Session = {
    id: string
    scheduledAt: string
    totalCallDuration: number
    status: string
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

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [currentUserClerkId, setCurrentUserClerkId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const loadSessions = async () => {
        try {
            setLoading(true)
            const [sessionsResponse, currentUser] = await Promise.all([
                fetchAllSessions(),
                fetchMyProfile()
            ])
            setSessions(sessionsResponse.sessions)
            setCurrentUserClerkId(currentUser.clerkUserId)
        } catch (error: any) {
            toast.error(error.message || "Failed to load sessions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    const handleConfirm = async (sessionId: string) => {
        try {
            await confirmSession(sessionId)
            toast.success("Session confirmed successfully!")
            await loadSessions()
        } catch (error: any) {
            toast.error(error.message || "Failed to confirm session")
        }
    }

    const handleCancel = async (sessionId: string) => {
        try {
            await cancelSession(sessionId)
            toast.success("Session cancelled successfully!")
            await loadSessions()
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel session")
        }
    }

    const handleStartSession = async (sessionId: string) => {
        try {
            await startSession(sessionId)
            toast.success("Session started successfully!")
            await loadSessions()
        } catch (error: any) {
            toast.error(error.message || "Failed to start session")
        }
    }

    return (
        <SessionsList
            sessions={sessions}
            currentUserClerkId={currentUserClerkId}
            loading={loading}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onStartSession={handleStartSession}
        />
    )
}
