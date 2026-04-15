"use client"

import React, { useState } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { updateMentorshipRequestStatus } from "@/services/mentorship-request.service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "../retroui/Button"
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
    const router = useRouter()

    const handleAction = async (action: "ACCEPT" | "REJECT") => {
        try {
            setIsProcessing(true)
            await updateMentorshipRequestStatus(id, action)
            toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully`)
            
            setTimeout(() => {
                router.push("/requests")
            }, 800)
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action.toLowerCase()} request`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg rounded-xl border border-black/20">

            {/* Header */}
            <div className="px-6 py-4 bg-linear-to-r from-background to-muted/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {mentee.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/profile/${mentee.id}`} className="text-sm font-bold truncate hover:underline cursor-pointer">{mentee.name}</Link>
                    <p className="text-xs text-muted-foreground">
                        Mentorship Request
                    </p>
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </span>
            </div>

            <Separator />

            {/* Request Details */}
            <div className="px-6 py-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Request Details
                </p>

                <p className="text-sm font-semibold leading-snug">
                    {title}
                </p>

                <Badge
                    variant="secondary"
                    className="text-xs rounded-full px-3 py-1"
                >
                    {skill.name}
                </Badge>
            </div>

            <Separator />

            {/* Message */}
            <div className="px-6 py-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Message
                </p>

                <div className="relative rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 rounded-l-lg"></div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className={`px-6 py-4 flex gap-3 flex-col sm:flex-row ${DM_Sans_Font.className}`}>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isProcessing}
                            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isProcessing ? "Processing..." : "Accept"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Accept Mentorship Request</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to accept this request? After accepting, the mentee will be able to ask for a session availability.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-green-500 cursor-pointer" onClick={() => handleAction("ACCEPT")}>
                                Accept Request
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isProcessing}
                            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isProcessing ? "Processing..." : "Reject"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Mentorship Request</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reject this request? This action cannot be undone and the mentee will be notified.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 cursor-pointer" onClick={() => handleAction("REJECT")}>
                                Reject Request
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </Card>
    )
}