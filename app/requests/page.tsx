"use client"

import Link from "next/link"
import RequestSidebarCard from "@/components/Request-Sidebar/RequestSidebarCard"
import { receivedMentorshipRequests, sentMentorshipRequests } from "@/services/mentorship-request.service"
import { fetchAllSessions } from "@/services/session.service"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DM_Sans } from "next/font/google"
import { Session } from "@/types/session"

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type MainFilter = "received" | "sent"
type StatusFilter = "all" | "pending" | "accepted" | "rejected"
type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED"

type Request = {
  id: string
  title: string
  message: string
  createdAt: string
  status?: RequestStatus
  mentee?: {
    id: string
    name: string
  }
  mentor?: {
    id: string
    name: string
  }
  skill?: {
    id: string
    name: string
  }
}

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

const statusFilterStyles: Record<StatusFilter, { active: string; resting: string }> = {
  all: {
    active: "border-[#323d28] bg-[#1b2116] text-[#f2f0e8]",
    resting: "text-[#a8ab9e] hover:border-[#3c4832] hover:bg-[#11140e] hover:text-[#f2f0e8]",
  },
  pending: {
    active: "border-[#6b5528] bg-[#2b2517] text-[#dfc47a]",
    resting: "text-[#c7a95c] hover:border-[#6b5528] hover:bg-[#201b12]",
  },
  accepted: {
    active: "border-[#265944] bg-[#14231f] text-[#6ee7b7]",
    resting: "text-[#56c797] hover:border-[#265944] hover:bg-[#111d19]",
  },
  rejected: {
    active: "border-[#61282d] bg-[#231214] text-[#f4b8bc]",
    resting: "text-[#e59ba1] hover:border-[#61282d] hover:bg-[#1d1012]",
  },
}

export default function RequestPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [mainFilter, setMainFilter] = useState<MainFilter>("received")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sessions, setSessions] = useState<Session[]>([])
  const [retryCount, setRetryCount] = useState(0)

  const handleStatusUpdate = (requestId: string) => {
    setRequests((previousRequests) =>
      previousRequests.filter((request) => request.id !== requestId)
    )
  }

  const hasScheduledSession = (request: Request) =>
    sessions.some((session) => session.mentorshipRequestId === request.id)

  useEffect(() => {
    let isCurrent = true

    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data =
          mainFilter === "received"
            ? await receivedMentorshipRequests()
            : await sentMentorshipRequests(
                statusFilter === "all" ? undefined : statusFilter
              )

        if (!isCurrent) return
        setRequests(data.data ?? [])

        try {
          const sessionsData = await fetchAllSessions()
          if (isCurrent) setSessions(sessionsData.sessions ?? [])
        } catch (sessionsError) {
          console.error("Failed to fetch sessions:", sessionsError)
        }
      } catch (fetchError: unknown) {
        if (isCurrent) {
          const errorMessage =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load mentorship requests."
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void fetchRequests()

    return () => {
      isCurrent = false
    }
  }, [mainFilter, statusFilter, retryCount])

  const changeMainFilter = (value: MainFilter) => {
    setMainFilter(value)
    setStatusFilter("all")
  }

  return (
    <div className={`${DM_Sans_Font.className} min-h-full bg-[#090a08] text-[#f2f0e8]`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        <header className="flex flex-col gap-5 border-b border-[#1e2419] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#f2f0e8] sm:text-4xl">
              Requests
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#a8ab9e] sm:text-base">
              Review requests from peers and check on the ones you sent.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center justify-center self-start rounded-xl border border-[#3a4530] px-4 text-sm font-medium text-[#c7cabf] transition-colors hover:border-[#8fa654] hover:bg-[#11140e] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] active:bg-[#161b12] sm:self-auto"
          >
            Find a peer
          </Link>
        </header>

        <section className="mt-6" aria-label="Mentorship request views">
          <div role="group" aria-label="Choose received or sent requests" className="grid grid-cols-2 gap-2 sm:max-w-md">
            {([
              { value: "received", label: "Received", description: "From peers" },
              { value: "sent", label: "Sent", description: "Your requests" },
            ] as const).map(({ value, label, description }) => {
              const isActive = mainFilter === value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => changeMainFilter(value)}
                  className={`flex min-h-14 flex-col justify-center rounded-xl border px-4 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] ${
                    isActive
                      ? "border-[#323d28] bg-[#1b2116] text-[#f2f0e8]"
                      : "border-[#242a1e] bg-[#0d0f0b] text-[#c7cabf] hover:border-[#3c4832] hover:bg-[#11140e] active:bg-[#161b12]"
                  }`}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={`mt-0.5 text-xs ${isActive ? "text-[#b7cc7e]" : "text-[#8a8f80]"}`}>
                    {description}
                  </span>
                </button>
              )
            })}
          </div>

          {mainFilter === "sent" && (
            <div
              role="group"
              aria-label="Filter sent requests by status"
              className="mt-4 flex flex-wrap gap-2"
            >
              {statusFilters.map(({ value, label }) => {
                const isActive = statusFilter === value
                const styles = statusFilterStyles[value]

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(value)}
                    className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] ${
                      isActive
                        ? styles.active
                        : `border-transparent ${styles.resting} active:bg-[#161b12]`
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {isLoading && (
          <div role="status" aria-live="polite" className="mt-6 space-y-3">
            <p className="sr-only">Loading mentorship requests</p>
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                aria-hidden="true"
                className="rounded-2xl border border-[#242a1e] bg-[#11140e] p-5"
              >
                <div className="h-4 w-40 animate-pulse rounded bg-[#242a1e] motion-reduce:animate-none" />
                <div className="mt-4 h-3 w-3/4 animate-pulse rounded bg-[#1e2419] motion-reduce:animate-none" />
                <div className="mt-5 h-11 w-48 animate-pulse rounded-lg bg-[#0d0f0b] motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#61282d] bg-[#231214] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-semibold text-[#f4b8bc]">Requests could not be loaded</h2>
              <p className="mt-1 text-sm text-[#e2afb2]">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[#8d474c] px-4 text-sm font-medium text-[#f4b8bc] transition-colors hover:bg-[#351a1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc] active:bg-[#231214]"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && requests.length === 0 && (
          <section className="mt-6 rounded-2xl border border-[#242a1e] bg-[#11140e] p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#f2f0e8]">
              {mainFilter === "received"
                ? "No requests waiting for you"
                : statusFilter === "all"
                  ? "You have not sent a request yet"
                  : `No ${statusFilters.find((filter) => filter.value === statusFilter)?.label.toLowerCase()} requests`}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a8ab9e]">
              {mainFilter === "received"
                ? "Requests from peers will appear here when they ask to learn from you."
                : statusFilter === "all"
                  ? "Find a peer whose skills match what you want to learn."
                  : "Try another status to see your other requests."}
            </p>
            {mainFilter === "sent" && statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#3a4530] px-4 text-sm font-medium text-[#c7cabf] transition-colors hover:border-[#8fa654] hover:bg-[#161b12] hover:text-[#f2f0e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
              >
                Show all sent requests
              </button>
            ) : (
              <Link
                href="/search"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8fa654] px-4 text-sm font-semibold text-[#0b0d08] transition-colors hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e]"
              >
                Find a peer
              </Link>
            )}
          </section>
        )}

        {!isLoading && !error && requests.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Mentorship requests">
            <h2 className="text-sm font-medium text-[#a8ab9e]">
              {mainFilter === "received"
                ? "Requests to review"
                : statusFilter === "all"
                  ? "Requests you sent"
                  : `${statusFilters.find((filter) => filter.value === statusFilter)?.label} requests`}
            </h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <RequestSidebarCard
                  key={request.id}
                  id={request.id}
                  title={request.title}
                  message={request.message}
                  createdAt={request.createdAt}
                  status={request.status ?? (mainFilter === "received" ? "PENDING" : undefined)}
                  mentee={request.mentee}
                  mentor={request.mentor}
                  skill={request.skill}
                  isSentView={mainFilter === "sent"}
                  hasScheduledSession={hasScheduledSession(request)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
