"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import SessionsList from "@/components/sessions/SessionsList"
import { fetchAllSessions, confirmSession, cancelSession, startSession } from "@/services/session.service"
import { fetchMyProfile } from "@/services/profile.service"
import { io, Socket } from "socket.io-client"
import { useAuth, useUser } from "@clerk/nextjs"

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
    const [socket, setSocket] = useState<Socket | null>(null)
    const [activeSessions, setActiveSessions] = useState<string[]>([])

    const { user } = useUser()
    const { getToken } = useAuth()

    useEffect(() => {
        const initSocket = async () => {
            try {
                const token = await getToken({ skipCache: true })

                if(!token) {
                    console.error("No token obtained from Clerk")
                    return
                }

                const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
                    transports: ["websocket", "polling"],
                    auth: { token },
                    withCredentials: true
                })

                setSocket(newSocket)
            } catch (error) {
                console.error("Error initializing socket:", error)
            }
        }

        initSocket()

    }, [getToken])

    const loadSessions = async () => {
        try {
            setLoading(true)
            const [sessionsResponse, currentUser] = await Promise.all([
                fetchAllSessions(),
                fetchMyProfile()
            ])
            setSessions(sessionsResponse.sessions)
            setCurrentUserClerkId(currentUser.clerkUserId)

            const inProgressSessions = sessionsResponse.sessions
                .filter((s: any) => s.status === "IN_PROGRESS")
                .map((s: any) => s.id)
            
            if (inProgressSessions.length > 0) {
                setActiveSessions(inProgressSessions)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load sessions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    useEffect(() => {
        if (!socket) return

        const handleSessionStarted = (data: any) => {
            console.log("Mentor started session: ", data)

            toast.success(`${data.mentor.name} started a session!`)
            setActiveSessions(prev => [...prev, data.sessionId])
        }

        socket.on("session:started", handleSessionStarted)
        
        return () => {
            socket.off("session:started", handleSessionStarted)
        }

    }, [socket])

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
            activeSessions={activeSessions}
        />
    )
}
