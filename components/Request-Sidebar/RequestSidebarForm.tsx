"use client"

import React from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"

type RequestSidebarFormProps = {
    id: string
    title: string
    message: string
    mentee: {
        id: string
        name: string
        clerkUserId: string
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
    console.log("Message: ", {message})
    return (
        <Card className="w-full max-w-xl overflow-hidden shadow-md">

            {/* Header with Avatar */}
            <div className="px-5 pt-5 pb-4 border-b border-border/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-base font-semibold shadow-sm shrink-0">
                    {mentee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight leading-none">{mentee.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Mentorship Request</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            </div>

            {/* Request Title + Skill */}
            <div className="px-5 py-4 border-b border-border/60 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Request</p>
                <p className="text-sm font-medium leading-snug">{title}</p>
                <div className="pt-1">
                    <Badge variant="secondary" className="text-xs rounded-full px-2.5">
                        {skill.name}
                    </Badge>
                </div>
            </div>

            {/* Mentee Profile */}
            <div className="px-5 py-4 border-b border-border/60 space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Mentee Profile</p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <p className="text-[11px] text-muted-foreground font-medium">Offers</p>
                        <div className="flex flex-wrap gap-1">
                            {mentee.skillsOffered?.length > 0 ? (
                                mentee.skillsOffered.map((s) => (
                                    <Badge key={s.id} variant="outline" className="text-xs rounded-full px-2">
                                        {s.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground italic">None</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[11px] text-muted-foreground font-medium">Wants to Learn</p>
                        <div className="flex flex-wrap gap-1">
                            {mentee.skillsWanted?.length > 0 ? (
                                mentee.skillsWanted.map((s) => (
                                    <Badge key={s.id} variant="outline" className="text-xs rounded-full px-2">
                                        {s.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-muted-foreground italic">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Message */}
            <div className="px-5 py-4 space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Message</p>
                <div className="relative">
                    {/* Decorative left accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-border" />
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap pl-3 py-0.5">
                        {message}
                    </p>
                </div>
            </div>

        </Card>
    )
}