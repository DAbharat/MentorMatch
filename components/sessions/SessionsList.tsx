"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/retroui/Button"
import { DM_Sans } from "next/font/google"
import { MessageCircleMore, X, Check, LogIn, CircleDot } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { fetchAllChatsForAUser } from "@/services/messages.service"
import { cleanupStuckSessions, completeSession } from "@/services/session.service"
import { createFeedback } from "@/services/feedback.service"
import FeedbackForm from "../feedback/FeedbackForm"
import { Session } from "@/types/session"
import { useAuth } from "@/hooks/useAuth"

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type SessionsListProps = {
  sessions: Session[]
  currentUserId: string | null
  loading: boolean
  errorMessage: string | null
  onRetry: () => void | Promise<void>
  onConfirm: (sessionId: string) => void
  onCancel: (sessionId: string) => void
  onStartSession: (sessionId: string) => void
  activeSessions: string[]
}

type SessionFilter =
  | "all"
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

function truncateWords(text: string, limit: number = 8) {
  if (!text) return ""

  const words = text.split(" ")
  if (words.length <= limit) return text

  return words.slice(0, limit).join(" ") + "..."
}

export default function SessionsList({
  sessions,
  currentUserId: propCurrentUserId,
  loading,
  errorMessage,
  onRetry,
  onConfirm,
  onCancel,
  onStartSession,
  activeSessions,
}: SessionsListProps) {
  const router = useRouter()
  const { userId: hookUserId } = useAuth()
  
  // Use hook userId as primary source, fall back to prop if needed
  const currentUserId = hookUserId || propCurrentUserId
  const [filter, setFilter] = useState<SessionFilter>("all")

  const [navigatingToChatId, setNavigatingToChatId] = useState<string | null>(null)
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [cancelingSessionId, setCancelingSessionId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [sessionTimers, setSessionTimers] = useState<Record<string, number>>({})
  const [mounted, setMounted] = useState(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const feedbackDialogRef = React.useRef<HTMLDialogElement>(null)

  const completedSessionsRef = React.useRef<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const dialog = feedbackDialogRef.current
    if (!dialog) return

    if (showFeedbackForm && !dialog.open) {
      dialog.showModal()
    } else if (!showFeedbackForm && dialog.open) {
      dialog.close()
    }
  }, [showFeedbackForm])

  // Update elapsed time for IN_PROGRESS sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimers(prevTimers => {
        const newTimers = { ...prevTimers }

        sessions.forEach((session: Session) => {
          if (session.status === "IN_PROGRESS" && session.callStartedAt) {
            const elapsedSeconds =
              (new Date().getTime() - new Date(session.callStartedAt).getTime()) / 1000

            // Cap elapsed time at session duration
            const durationSeconds = session.totalCallDuration * 60
            const cappedSeconds = Math.min(Math.floor(elapsedSeconds), durationSeconds)

            newTimers[session.id] = cappedSeconds
          }
        })

        return newTimers
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessions])

  // Handle auto-completion when time limit is reached
  useEffect(() => {
    sessions.forEach((session: Session) => {
      if (session.status === "IN_PROGRESS" && session.callStartedAt) {
        const elapsedSeconds =
          (new Date().getTime() - new Date(session.callStartedAt).getTime()) / 1000
        const durationSeconds = session.totalCallDuration * 60

        // Auto-complete only once per session
        if (elapsedSeconds >= durationSeconds && !completedSessionsRef.current.has(session.id)) {
          completedSessionsRef.current.add(session.id)

          // Call API to mark session as COMPLETED
          completeSession(session.id)
            .then(() => {
              router.refresh()
              toast.success("Session completed!")
            })
            .catch((error) => {
              console.error("Failed to complete session:", error)
              toast.error("Failed to complete session automatically")
            })
        }
      }
    })
  }, [sessions, router])

  const filteredSessions = sessions.filter((session: Session) => {
    if (filter === "all") return true
    return session.status === filter
  })

  const handleNavigateToChat = async (session: Session) => {
    setNavigatingToChatId(session.id)
    try {
      const response = await fetchAllChatsForAUser()
      const chats = response.chats || []

      const matchingChat = chats.find(
        (chat: any) =>
          chat.mentor.id === session.mentor.id &&
          chat.mentee.id === session.mentee.id &&
          chat.skill?.id === session.skill.id
      )

      if (matchingChat) {
        router.push(`/chats/${matchingChat.id}`)
      } else {
        toast.error("Chat not found. The mentorship may not be active yet.")
      }
    } catch {
      toast.error("Failed to open chat")
    } finally {
      setNavigatingToChatId(null)
    }
  }

  const handleStartSession = async (session: Session) => {
    setLoadingSessionId(session.id)
    try {
      await onStartSession(session.id)

      toast.success("Session starting. Redirecting to video call...")
      router.push(`/sessions/video-call/${session.id}`)

    } catch (error: any) {
      toast.error(error.message || "Failed to start session")
    } finally {
      setLoadingSessionId(null)
    }
  }

  const handleJoinSession = (session: Session) => {
    setLoadingSessionId(session.id)
    try {
      const isRejoin = session.status === "IN_PROGRESS"
      console.log("[SessionsList] handleJoinSession called - session status:", session.status, "isRejoin:", isRejoin)

      const url = isRejoin
        ? `/sessions/video-call/${session.id}?rejoin=true`
        : `/sessions/video-call/${session.id}`

      console.log("[SessionsList] Navigating to:", url)
      router.push(url)
    } catch (error: any) {
      toast.error(error.message || "Failed to join session")
      setLoadingSessionId(null)
    }
  }

  const handleCompleteSessionManually = async (session: Session) => {
    if (!session.callStartedAt) return

    const elapsedSeconds =
      (new Date().getTime() - new Date(session.callStartedAt).getTime()) / 1000

    if (elapsedSeconds < 600) { 
      toast.error("Cannot mark the session as complete before 10 min")
      return
    }

    setCompletingSessionId(session.id)
    try {
      await completeSession(session.id)
      toast.success("Session completed!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to complete session")
    } finally {
      setCompletingSessionId(null)
    }
  }

  const handleConfirmSession = async (session: Session) => {
    setLoadingSessionId(session.id)
    try {
      await onConfirm(session.id)
      toast.success("Session confirmed successfully!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm session")
    } finally {
      setLoadingSessionId(null)
    }
  }

  const handleCancelSession = async () => {
    if (!cancelingSessionId) return
    setLoadingSessionId(cancelingSessionId)
    try {
      await onCancel(cancelingSessionId)
      toast.success("Session cancelled successfully!")
      setShowCancelDialog(false)
      setCancelingSessionId(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel session")
    } finally {
      setLoadingSessionId(null)
    }
  }

  const handleSubmitFeedback = async (formData: { rating: number; comment: string }) => {
    if (!feedbackSessionId) return

    const session = sessions.find(s => s.id === feedbackSessionId)
    if (!session) return

    setFeedbackLoading(true)
    try {
      await createFeedback({
        mentorId: session.mentor.id,
        sessionId: feedbackSessionId,
        rating: formData.rating,
        comment: formData.comment
      })

      toast.success("Feedback submitted successfully!")

      setShowFeedbackForm(false)
      setFeedbackSessionId(null)

      router.refresh()

    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback")
    } finally {
      setFeedbackLoading(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCleanupStuckSessions = async () => {
    setIsCleaningUp(true)
    try {
      console.log("Starting cleanup...")
      const result = await cleanupStuckSessions()
      console.log("Cleanup result:", result)
      toast.success(`Cleaned up ${result.completedCount} stuck session(s)`)
      router.refresh()
    } catch (error: any) {
      console.error("Cleanup error:", error)
      toast.error(error.message || "Failed to cleanup stuck sessions")
    } finally {
      setIsCleaningUp(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "border-[#54472c] bg-[#2b2517] text-[#dfc47a]",
      CONFIRMED: "border-[#323d28] bg-[#1b2116] text-[#b7cc7e]",
      IN_PROGRESS: "border-[#2a4b45] bg-[#14231f] text-[#91d1c9]",
      COMPLETED: "border-[#303528] bg-[#191d16] text-[#a8ab9e]",
      CANCELLED: "border-[#61282d] bg-[#231214] text-[#f4b8bc]",
    }
    return colors[status] || "border-[#303528] bg-[#191d16] text-[#a8ab9e]"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    }
    return labels[status] || status.toLowerCase().replace(/_/g, " ")
  }

  const isMentor = (session: Session) => {
    if (!currentUserId) return false
    return session.mentor.id === currentUserId
  }

  const sessionPriority = (session: Session) => {
    if (session.status === "IN_PROGRESS") return 0
    if (session.status === "PENDING" && isMentor(session)) return 1
    if (session.status === "PENDING") return 2
    if (session.status === "CONFIRMED") return 3
    if (session.status === "COMPLETED") return 4
    return 5
  }

  const sortedSessions = [...filteredSessions].sort((first, second) => {
    const priorityDifference = sessionPriority(first) - sessionPriority(second)
    if (priorityDifference !== 0) return priorityDifference

    const timeDifference =
      new Date(first.scheduledAt).getTime() - new Date(second.scheduledAt).getTime()
    return first.status === "COMPLETED" || first.status === "CANCELLED"
      ? -timeDifference
      : timeDifference
  })

  const focusSession =
    sortedSessions.find((session) => session.status === "IN_PROGRESS") ??
    sortedSessions.find((session) => session.status === "PENDING" && isMentor(session)) ??
    sortedSessions.find((session) => session.status === "CONFIRMED") ??
    null

  const statusFilters: { value: SessionFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ]

  const getFilterCount = (value: SessionFilter) =>
    value === "all"
      ? sessions.length
      : sessions.filter((session) => session.status === value).length

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false)
    setFeedbackSessionId(null)
  }
  const feedbackSession = sessions.find((session) => session.id === feedbackSessionId)

  return (
    <div className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] text-[#f2f0e8]`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-5 border-b border-[#1e2419] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#f2f0e8] sm:text-4xl">
              Sessions
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#a8ab9e] sm:text-base">
              See what is happening now, what needs a response, and what is coming up.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a3322] px-4 text-sm font-medium text-[#c7cabf] transition-colors hover:border-[#3c4832] hover:bg-[#11140e] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] active:bg-[#161b12]"
            >
              Find a mentor
            </Link>
            <Button
              onClick={handleCleanupStuckSessions}
              disabled={isCleaningUp}
              className="min-h-11 rounded-xl border border-[#2a3322] bg-transparent px-4 text-sm text-[#a8ab9e] transition-colors hover:border-[#3c4832] hover:bg-[#11140e] hover:text-[#f2f0e8] active:bg-[#161b12] disabled:opacity-60"
            >
              {isCleaningUp ? "Cleaning..." : "Clean up stuck sessions"}
            </Button>
          </div>
        </header>

        <div className="mt-5 border-b border-[#1e2419] pb-4">
          <div
            role="group"
            aria-label="Filter sessions by status"
            className="flex flex-wrap gap-2"
          >
            {statusFilters.map(({ value, label }) => {
              const isActive = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(value)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] ${
                    isActive
                      ? "border-[#323d28] bg-[#1b2116] text-[#f2f0e8]"
                      : "border-transparent text-[#a8ab9e] hover:border-[#242a1e] hover:bg-[#11140e] hover:text-[#f2f0e8] active:bg-[#161b12]"
                  }`}
                >
                  <span>{label}</span>
                  <span className={isActive ? "text-[#b7cc7e] tabular-nums" : "text-[#787d6f] tabular-nums"}>
                    {getFilterCount(value)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {loading && (
          <div role="status" aria-live="polite" className="mt-6 space-y-3">
            <p className="sr-only">Loading sessions</p>
            <div aria-hidden="true" className="space-y-3">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="rounded-2xl border border-[#242a1e] bg-[#11140e] p-5 motion-reduce:animate-none"
                >
                  <div className="h-4 w-36 animate-pulse rounded bg-[#242a1e]" />
                  <div className="mt-4 h-3 w-56 animate-pulse rounded bg-[#1e2419]" />
                  <div className="mt-5 h-11 w-full animate-pulse rounded-lg bg-[#0d0f0b]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && errorMessage && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#61282d] bg-[#231214] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-semibold text-[#f4b8bc]">Sessions could not be loaded</h2>
              <p className="mt-1 text-sm text-[#e2afb2]">{errorMessage}</p>
            </div>
            <Button
              type="button"
              onClick={() => void onRetry()}
              className="min-h-11 shrink-0 rounded-xl border border-[#8d474c] bg-transparent px-4 text-sm text-[#f4b8bc] hover:bg-[#351a1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc]"
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !errorMessage && sessions.length === 0 && (
          <section className="mt-8 rounded-2xl border border-[#242a1e] bg-[#11140e] p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#f2f0e8]">No sessions scheduled yet</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a8ab9e]">
              When you arrange a mentorship session, its time, details, and next steps will appear here.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8fa654] px-4 text-sm font-semibold text-[#0b0d08] transition-colors hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
            >
              Browse mentors
            </Link>
          </section>
        )}

        {!loading && !errorMessage && sessions.length > 0 && filteredSessions.length === 0 && (
          <section className="mt-8 rounded-2xl border border-[#242a1e] bg-[#11140e] p-6">
            <h2 className="font-semibold text-[#f2f0e8]">
              No {statusFilters.find((item) => item.value === filter)?.label.toLowerCase()} sessions
            </h2>
            <p className="mt-2 text-sm text-[#a8ab9e]">
              Choose another status to see the rest of your sessions.
            </p>
            <Button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-4 min-h-11 rounded-xl border border-[#2a3322] bg-transparent px-4 text-sm text-[#c7cabf] hover:bg-[#161b12] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
            >
              Show all sessions
            </Button>
          </section>
        )}

        {!loading && !errorMessage && filteredSessions.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Your sessions">
            <h2 className="text-sm font-medium text-[#a8ab9e]">
              {filter === "all" ? "Session queue" : `${statusFilters.find((item) => item.value === filter)?.label} sessions`}
            </h2>
            <div className="space-y-3">
              {sortedSessions.map((session) => {
                const hasFeedback = !!session.feedback
                const isFocus = filter === "all" && session.id === focusSession?.id
                const elapsedPercent = session.totalCallDuration > 0
                  ? Math.min(
                    ((sessionTimers[session.id] || 0) / (session.totalCallDuration * 60)) * 100,
                    100
                  )
                  : 0

                return (
                  <Card
                    key={session.id}
                    className={`p-4 shadow-none sm:p-5 ${
                      isFocus
                        ? "rounded-2xl border-[#3a4730] bg-[#11140e] sm:p-6"
                        : "rounded-xl border-[#242a1e] bg-[#0f120d]"
                    }`}
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        {isFocus && (
                          <p className="text-xs font-semibold text-[#b7cc7e]">
                            {session.status === "IN_PROGRESS"
                              ? "In progress now"
                              : session.status === "PENDING" && isMentor(session)
                                ? "Needs your response"
                                : "Next session"}
                          </p>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold leading-tight text-[#f2f0e8]">
                              {session.skill.name}
                            </h3>
                            <Badge className={`${getStatusColor(session.status)} shrink-0 rounded-md border text-xs font-medium`}>
                              {getStatusLabel(session.status)}
                            </Badge>
                            {activeSessions.includes(session.id) && (
                              <Badge className="flex shrink-0 items-center gap-1 rounded-md border border-[#2a4b45] bg-[#14231f] text-xs text-[#91d1c9]">
                                <CircleDot aria-hidden="true" className="h-2 w-2 fill-current" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[#a8ab9e]">
                            {isMentor(session) ? "Mentoring" : "Learning with"}{" "}
                            <span className="font-medium text-[#c7cabf]">
                              {isMentor(session) ? session.mentee.name : session.mentor.name}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-[#1e2419] pt-3 text-sm sm:gap-5">
                        <div className="min-w-0">
                          <p className="text-xs text-[#8a8f80]">Scheduled</p>
                          <time
                            dateTime={session.scheduledAt}
                            className="mt-1 block font-medium leading-snug text-[#c7cabf]"
                          >
                            {new Date(session.scheduledAt).toLocaleString()}
                          </time>
                        </div>
                        <div>
                          <p className="text-xs text-[#8a8f80]">Duration</p>
                          <p className="mt-1 font-medium text-[#c7cabf]">
                            {session.totalCallDuration} min
                          </p>
                        </div>
                      </div>

                    {session.status === "PENDING" && isMentor(session) && (
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <Button
                            className="min-h-11 flex-1 rounded-xl bg-[#8fa654] py-2 text-sm font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
                          onClick={() => handleConfirmSession(session)}
                          disabled={loadingSessionId === session.id}
                        >
                            <Check aria-hidden="true" className="mr-2 h-4 w-4" />
                          {loadingSessionId === session.id
                            ? "Confirming..."
                              : "Confirm session"}
                        </Button>
                        <Button
                            className="min-h-11 flex-1 rounded-xl border border-[#61282d] bg-transparent py-2 text-sm text-[#f4b8bc] hover:bg-[#231214] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc]"
                          onClick={() => {
                            setCancelingSessionId(session.id)
                            setShowCancelDialog(true)
                          }}
                          disabled={loadingSessionId === session.id}
                        >
                            Cancel session
                        </Button>
                      </div>
                    )}

                    {session.status === "CONFIRMED" && (
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <Button
                            className="min-h-11 flex-1 rounded-xl border border-[#2a3322] bg-[#161b12] py-2 text-sm text-[#c7cabf] hover:border-[#3c4832] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
                          onClick={() => handleNavigateToChat(session)}
                          disabled={navigatingToChatId === session.id}
                        >
                            <MessageCircleMore aria-hidden="true" className="mr-2 h-4 w-4" />
                          {navigatingToChatId === session.id
                              ? "Opening chat..."
                            : "Message"}
                        </Button>

                        {!activeSessions.includes(session.id) && isMentor(session) && (
                          <Button
                              className="min-h-11 flex-1 rounded-xl bg-[#8fa654] py-2 text-sm font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
                            onClick={() => handleStartSession(session)}
                            disabled={loadingSessionId === session.id}
                          >
                            {loadingSessionId === session.id
                              ? "Starting..."
                                : "Start session"}
                          </Button>
                        )}

                        {activeSessions.includes(session.id) && (
                          <Button
                              className="min-h-11 flex-1 rounded-xl bg-[#8fa654] py-2 text-sm font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
                            onClick={() => handleJoinSession(session)}
                            disabled={loadingSessionId === session.id}
                          >
                              <LogIn aria-hidden="true" className="mr-2 h-4 w-4" />
                            {loadingSessionId === session.id
                              ? "Joining..."
                                : "Join session"}
                          </Button>
                        )}
                      </div>
                    )}

                    {session.status === "IN_PROGRESS" && session.callStartedAt && (
                      <div className="space-y-3 border-t border-[#1e2419] pt-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-xs text-[#a8ab9e]">Session elapsed</p>
                          <p className="font-mono text-lg font-semibold tabular-nums text-[#f2f0e8]">
                            {formatTimer(sessionTimers[session.id] || 0)}
                            <span className="ml-2 text-sm font-normal text-[#8a8f80]">
                              of {session.totalCallDuration}:00
                            </span>
                          </p>
                        </div>
                        <div
                          role="progressbar"
                          aria-label="Session duration elapsed"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(elapsedPercent)}
                          className="h-2 overflow-hidden rounded-full bg-[#242a1e]"
                        >
                          <div
                            className="h-full rounded-full bg-[#8fa654] transition-[width] duration-300 motion-reduce:transition-none"
                            style={{ width: `${elapsedPercent}%` }}
                          />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            className="min-h-11 flex-1 rounded-xl border border-[#2a3322] bg-[#161b12] py-2 text-sm text-[#c7cabf] hover:border-[#3c4832] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
                            onClick={() => handleNavigateToChat(session)}
                            disabled={navigatingToChatId === session.id}
                          >
                            <MessageCircleMore aria-hidden="true" className="mr-2 h-4 w-4" />
                            {navigatingToChatId === session.id ? "Opening chat..." : "Message"}
                          </Button>

                          <Button
                            className="min-h-11 flex-1 rounded-xl bg-[#8fa654] py-2 text-sm font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
                            onClick={() => handleJoinSession(session)}
                            disabled={loadingSessionId === session.id}
                          >
                            <LogIn aria-hidden="true" className="mr-2 h-4 w-4" />
                            {loadingSessionId === session.id ? "Joining..." : "Join session"}
                          </Button>
                        </div>

                        {isMentor(session) && (
                          <Button
                            className="min-h-11 w-full rounded-xl border border-[#2a3322] bg-transparent py-2 text-sm text-[#c7cabf] hover:bg-[#161b12] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
                            onClick={() => handleCompleteSessionManually(session)}
                            disabled={completingSessionId === session.id}
                          >
                            {completingSessionId === session.id
                              ? "Completing..."
                              : "Complete session"}
                          </Button>
                        )}
                      </div>
                    )}

                    {session.status === "COMPLETED" && !isMentor(session) && (
                      <div className="pt-1">
                        {hasFeedback ? (
                          <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#303528] bg-[#191d16] text-sm text-[#a8ab9e]">
                            <Check aria-hidden="true" className="h-4 w-4 text-[#b7cc7e]" />
                            <span>Feedback sent</span>
                          </div>
                        ) : (
                          <Button
                            className="min-h-11 w-full rounded-xl bg-[#8fa654] py-2 text-sm font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
                            onClick={() => {
                              setFeedbackSessionId(session.id)
                              setShowFeedbackForm(true)
                            }}
                          >
                            Give feedback
                          </Button>
                        )}
                      </div>
                    )}

                    {session.status === "COMPLETED" && isMentor(session) && (
                      <div className="pt-1">
                        {hasFeedback ? (
                          <div className="rounded-xl border border-[#242a1e] bg-[#0d0f0b] p-4">
                            <div className="mb-3 flex items-center gap-2 text-[#a8ab9e]">
                              <Check aria-hidden="true" className="h-4 w-4 text-[#b7cc7e]" />
                              <span className="text-sm font-medium">Feedback received</span>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-xs text-[#8a8f80]">Rating</p>
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const rating = session.feedback?.rating ?? 0
                                    return Array.from({ length: rating }).map((_, i) => (
                                      <span key={i} className="text-[#f59e0b]">★</span>
                                    ))
                                  })()}
                                  <span className="ml-1 text-[#a8ab9e]">
                                    ({session.feedback?.rating ?? 0}/5)
                                  </span>
                                </div>
                              </div>

                              {session.feedback?.comment && (
                                <div>
                                  <p className="text-xs text-[#8a8f80]">Comment</p>
                                  <p
                                  className="text-[#c7cabf]"
                                  title={session.feedback.comment || ""}
                                  >
                                  {truncateWords(session.feedback.comment)}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        ) : (
                          <p className="rounded-xl border border-[#303528] bg-[#191d16] px-4 py-3 text-center text-sm text-[#a8ab9e]">
                            Awaiting feedback from mentee
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {showFeedbackForm && feedbackSession && mounted && (
        <dialog
          ref={feedbackDialogRef}
          aria-labelledby="feedback-dialog-title"
          onCancel={(event) => {
            event.preventDefault()
            closeFeedbackForm()
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeFeedbackForm()
          }}
          className="fixed m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-0 bg-transparent p-0 text-inherit shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)] backdrop:bg-black/75"
        >
          <div className="relative">
            <button
              type="button"
              onClick={closeFeedbackForm}
              aria-label="Close feedback form"
              className="absolute right-2 top-2 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#2a3322] bg-[#161b12] transition-colors hover:bg-[#1b2116] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
            >
              <X aria-hidden="true" className="h-5 w-5 text-[#c7cabf]" />
            </button>
            <FeedbackForm
              id={feedbackSession.id}
              sessionId={feedbackSession.id}
              mentor={feedbackSession.mentor}
              mentee={feedbackSession.mentee}
              skill={feedbackSession.skill}
              isModal={true}
              loading={feedbackLoading}
              onSubmit={handleSubmitFeedback}
            />
          </div>
        </dialog>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="border-[#242a1e] bg-[#11140e]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f2f0e8]">Cancel session</AlertDialogTitle>
            <AlertDialogDescription className="text-[#a8ab9e]">
              Are you sure you want to cancel this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 rounded-xl border border-[#2a3322] bg-[#161b12] text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8]">
              Keep session
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSession}
              disabled={loadingSessionId === cancelingSessionId}
              className="min-h-11 rounded-xl border border-[#8d474c] bg-[#61282d] text-[#f4b8bc] hover:bg-[#77343a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc] disabled:opacity-60"
            >
              {loadingSessionId === cancelingSessionId ? "Cancelling..." : "Cancel session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}