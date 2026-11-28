"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateMentorshipRequestStatus } from "@/services/mentorship-request.service"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED"

type RequestSidebarProps = {
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
  isSentView?: boolean
  hasScheduledSession?: boolean
  onStatusUpdate?: (requestId: string) => void
}

export default function RequestSidebarCard(
  {
    id,
    title,
    message,
    createdAt,
    status,
    mentee,
    mentor,
    skill,
    isSentView = false,
    hasScheduledSession = false,
    onStatusUpdate,
  }: RequestSidebarProps
) {
  const [processingAction, setProcessingAction] = useState<"ACCEPT" | "REJECT" | null>(null)
  const actionLockRef = useRef(false)
  const router = useRouter()

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    if (actionLockRef.current || status !== "PENDING") return
    actionLockRef.current = true
    setProcessingAction(action)

    try {
      await updateMentorshipRequestStatus(id, action)
      toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully`)
      onStatusUpdate?.(id)
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action.toLowerCase()} request`
      )
      actionLockRef.current = false
      setProcessingAction(null)
    }
  }

  const handleScheduleSession = () => {
    if (mentor?.id) router.push(`/sessions/schedule/${mentor.id}/${id}`)
  }

  const displayUser = isSentView ? mentor : mentee
  const userName = displayUser?.name || "Unknown user"
  const userId = displayUser?.id
  const statusStyles: Record<RequestStatus, string> = {
    PENDING: "border-[#6b5528] bg-[#2b2517] text-[#dfc47a]",
    ACCEPTED: "border-[#265944] bg-[#14231f] text-[#6ee7b7]",
    REJECTED: "border-[#61282d] bg-[#231214] text-[#f4b8bc]",
  }

  const requestDate = new Date(createdAt)
  const dateLabel = Number.isNaN(requestDate.getTime())
    ? "Date unavailable"
    : requestDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

  return (
    <Card className="w-full rounded-2xl border border-[#242a1e] bg-[#11140e] p-3 shadow-none sm:p-4">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#3a4530] bg-[#1b2116] text-base font-semibold text-[#b7cc7e]"
        >
          {userName.charAt(0).toUpperCase() || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs text-[#8a8f80]">
                {isSentView ? "To" : "From"}
              </span>
              {userId ? (
                <Link
                  href={`/profile/${userId}`}
                  className="min-h-11 truncate py-2 text-sm font-semibold text-[#f2f0e8] underline-offset-4 hover:text-[#cde099] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
                >
                  {userName}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[#f2f0e8]">{userName}</span>
              )}
              {status && (
                <Badge
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
            <time
              dateTime={Number.isNaN(requestDate.getTime()) ? undefined : requestDate.toISOString()}
              className="shrink-0 text-xs tabular-nums text-[#a8ab9e]"
            >
              {dateLabel}
            </time>
          </div>

          <h3 className="mt-1 break-words text-base font-semibold leading-snug text-[#f2f0e8]">
            <Link
              href={`/requests/${id}`}
              className="underline-offset-4 hover:text-[#cde099] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
            >
              {title}
            </Link>
          </h3>
          {skill && (
            <p className="mt-1 break-words text-sm font-medium text-[#cde099]">{skill.name}</p>
          )}
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#c7cabf]">
            {message}
          </p>

          {!isSentView && status === "PENDING" && (
            <div className="mt-3 flex flex-col gap-2 border-t border-[#1e2419] pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => void handleAction("ACCEPT")}
                disabled={processingAction !== null}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#8fa654] bg-[#8fa654] px-4 text-sm font-semibold text-[#0b0d08] transition-colors hover:border-[#9eb660] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-36"
              >
                {processingAction === "ACCEPT" ? "Accepting..." : "Accept request"}
              </button>
              <button
                type="button"
                onClick={() => void handleAction("REJECT")}
                disabled={processingAction !== null}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#5d6a4f] bg-[#0d0f0b] px-4 text-sm font-medium text-[#c7cabf] transition-colors hover:border-[#8d474c] hover:bg-[#231214] hover:text-[#f4b8bc] active:bg-[#1d1012] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-28"
              >
                {processingAction === "REJECT" ? "Rejecting..." : "Decline"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isSentView && status === "ACCEPTED" && (
        <div className="mt-3 flex justify-end border-t border-[#1e2419] pt-3">
          <button
            type="button"
            onClick={handleScheduleSession}
            disabled={hasScheduledSession || !mentor?.id}
            title={hasScheduledSession ? "A session is already scheduled for this request" : undefined}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654] sm:w-auto ${
              hasScheduledSession || !mentor?.id
                ? "cursor-not-allowed border-[#2a3322] bg-[#161b12] text-[#8a8f80]"
                : "cursor-pointer border-[#3a4530] bg-[#8fa654] text-[#0b0d08] hover:border-[#9eb660] hover:bg-[#9eb660] active:bg-[#7f9449]"
            }`}
          >
            <Calendar aria-hidden="true" className="h-4 w-4 shrink-0" />
            {hasScheduledSession ? "Session scheduled" : "Schedule a session"}
          </button>
        </div>
      )}
    </Card>
  )
}