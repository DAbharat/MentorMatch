"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/retroui/Button"
import { DM_Sans } from "next/font/google"
import { MessageCircleMore, SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export default function SessionsList({
  sessions,
  currentUserClerkId,
  loading,
  onConfirm,
  onCancel,
}: SessionsListProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed"
  >("all")
  const [navigatingToChatId, setNavigatingToChatId] = useState<string | null>(
    null
  )

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true
    return session.status.toLowerCase() === filter
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const isMentor = (session: Session) =>
    session.mentor.clerkUserId === currentUserClerkId

  return (
  <div className={`${DM_Sans_Font.className} bg-[#0b090a] min-h-screen`}>
    
    {/* Top Filter Bar */}
    <div className="container max-w-4xl mx-auto px-4 pt-6 pb-2">
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-white border border-black text-black hover:bg-gray-100 flex items-center gap-2 text-xs sm:text-sm">
              <SlidersHorizontal className="w-4 h-4" />
              {/* <span className="hidden sm:inline">Filter</span> */}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-44 p-2 bg-[#161a1d]">
            <div className="space-y-1">
              {["all", "pending", "confirmed", "completed"].map((f) => {
                const isActive = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition ${
                      isActive
                        ? "bg-black text-white"
                        : "hover:bg-gray-800 text-[#d3d3d3]"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    {/* Sessions List */}
    <div className="container max-w-4xl mx-auto px-4 pb-6">
      <div className="space-y-4">

        {loading && (
          <p className="text-center text-muted-foreground py-6">
            Loading sessions...
          </p>
        )}

        {!loading && filteredSessions.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No sessions found</p>
          </Card>
        )}

        {!loading &&
          filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="p-5 bg-[#161a1d] border-none shadow-md shadow-black/30"
            >
              <div className="space-y-3">

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-[#d3d3d3]">
                        {session.skill.name}
                      </h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      with{" "}
                      {isMentor(session)
                        ? session.mentee.name
                        : session.mentor.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scheduled</p>
                    <p className="font-medium text-[#d3d3d3]">
                      {new Date(session.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-[#d3d3d3]">
                      {session.totalCallDuration} minutes
                    </p>
                  </div>
                </div>

                {session.status === "CONFIRMED" && (
                  <div className="pt-1">
                    <Button
                      className="w-full bg-white text-black hover:bg-[#d3d3d3] border border-black rounded-2xl"
                      onClick={() => handleNavigateToChat(session)}
                      disabled={navigatingToChatId === session.id}
                    >
                      <MessageCircleMore className="mr-2 size-4" />
                      {navigatingToChatId === session.id
                        ? "Opening..."
                        : "Message"}
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