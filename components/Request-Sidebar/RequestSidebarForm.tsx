"use client"

import React, { useRef, useState } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { updateMentorshipRequestStatus } from "@/services/mentorship-request.service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { DM_Sans } from "next/font/google"


const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type RequestSidebarFormProps = {
    id: string
    title: string
    message: string
    mentee: {
        id: string
        name: string
        skillsOffered: { id: string; name: string }[]
        skillsWanted: { id: string; name: string }[]
    }
    skill: { id: string; name: string }
    createdAt: string
}

export default function RequestSidebarForm({
    id,
    title,
    message,
    mentee,
    skill,
    createdAt,
}: RequestSidebarFormProps) {

    const [isProcessing, setIsProcessing] = useState(false)
    const actionLockRef = useRef(false)
    const router = useRouter()

    const handleAction = async (action: "ACCEPT" | "REJECT") => {
        if (actionLockRef.current) return
        actionLockRef.current = true
        setIsProcessing(true)

        try {
            await updateMentorshipRequestStatus(id, action)
            toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully`)
            router.push("/requests")
        } catch (error: unknown) {
            actionLockRef.current = false
            setIsProcessing(false)
            toast.error(
                error instanceof Error
                    ? error.message
                    : `Failed to ${action.toLowerCase()} request`
            )
        }
    }

    return (
        <Card className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#242a1e] bg-[#11140e] shadow-none">

            {/* Header */}
            <div className="flex items-start gap-3 px-5 py-5 sm:items-center sm:gap-4 sm:px-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#3a4530] bg-[#161b12] text-lg font-semibold text-[#b7cc7e]">
                    {mentee.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/profile/${mentee.id}`} className="block truncate text-sm font-semibold text-[#f2f0e8] hover:text-[#cde099] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]">
                        {mentee.name}
                    </Link>
                    <p className="text-xs text-[#a8ab9e]">
                        Mentorship request
                    </p>
                </div>

                <time dateTime={createdAt} className="max-w-28 shrink-0 text-right text-xs leading-relaxed text-[#a8ab9e] sm:max-w-none">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </time>
            </div>

            <Separator className="bg-[#242a1e]" />

            {/* Request Details */}
            <div className="space-y-3 px-5 py-5 sm:px-6">
                <p className="text-xs font-medium text-[#a8ab9e]">
                    Request details
                </p>

                <p className="break-words text-base font-semibold leading-snug text-[#f2f0e8]">
                    {title}
                </p>

                <Badge variant="outline" className="rounded-md border-[#3a4530] bg-[#161b12] px-2.5 py-1 text-xs text-[#c7cabf]">
                    {skill.name}
                </Badge>
            </div>

            <Separator className="bg-[#242a1e]" />

            {/* Message */}
            <div className="space-y-3 px-5 py-5 sm:px-6">
                <p className="text-xs font-medium text-[#a8ab9e]">
                    Message
                </p>

                <div className="rounded-xl bg-[#0d0f0b] p-4">
                    <p className="break-words text-sm leading-relaxed text-[#c7cabf] whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
            </div>

            <Separator className="bg-[#242a1e]" />

            {/* Action Buttons */}
            <div className={`flex flex-col gap-3 px-5 py-5 sm:flex-row sm:px-6 ${DM_Sans_Font.className}`}>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isProcessing}
                            className="h-11 flex-1 cursor-pointer rounded-xl bg-[#10b981] text-sm font-semibold text-[#0b0d08] hover:bg-[#34d399] active:bg-[#059669] focus-visible:ring-2 focus-visible:ring-[#10b981] disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Accept"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-[#242a1e] bg-[#11140e] text-[#f2f0e8]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#f2f0e8]">Accept mentorship request</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#a8ab9e]">
                                Are you sure you want to accept this request? After accepting, the mentee will be able to ask for a session availability.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="h-11 cursor-pointer rounded-xl border-[#3a4530] bg-[#0d0f0b] text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#8fa654]">Cancel</AlertDialogCancel>
                            <AlertDialogAction disabled={isProcessing} className="h-11 cursor-pointer rounded-xl bg-[#10b981] text-[#0b0d08] hover:bg-[#34d399] focus-visible:ring-2 focus-visible:ring-[#10b981] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => handleAction("ACCEPT")}>
                                {isProcessing ? "Processing..." : "Accept Request"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isProcessing}
                            className="h-11 flex-1 cursor-pointer rounded-xl border border-[#61282d] bg-[#231214] text-sm font-semibold text-[#f4b8bc] hover:bg-[#30171a] active:bg-[#3b1b1f] focus-visible:ring-2 focus-visible:ring-[#f4b8bc] disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Reject"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-[#242a1e] bg-[#11140e] text-[#f2f0e8]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#f2f0e8]">Reject mentorship request</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#a8ab9e]">
                                Are you sure you want to reject this request? This action cannot be undone and the mentee will be notified.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="h-11 cursor-pointer rounded-xl border-[#3a4530] bg-[#0d0f0b] text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#8fa654]">Cancel</AlertDialogCancel>
                            <AlertDialogAction disabled={isProcessing} className="h-11 cursor-pointer rounded-xl border border-[#61282d] bg-[#231214] text-[#f4b8bc] hover:bg-[#30171a] focus-visible:ring-2 focus-visible:ring-[#f4b8bc] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => handleAction("REJECT")}>
                                {isProcessing ? "Processing..." : "Reject Request"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </Card>
    )
}