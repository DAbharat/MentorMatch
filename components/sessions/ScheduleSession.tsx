"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { DM_Sans } from "next/font/google"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type MentorInfo = {
    id: string
    name: string
    skillsOffered: { id: string; name: string }[]
}

type ScheduleSessionProps = {
    mentor: MentorInfo
    mentorshipRequestSkillId?: string | null
    mentorshipRequestSkillName?: string | null
    loading: boolean
    submitting: boolean
    onSubmit: (formData: {
        skillId: string
        scheduledAt: string
        totalCallDuration: number
    }) => Promise<void>
    onCancel: () => void
}

export default function ScheduleSession({
    mentor,
    mentorshipRequestSkillId,
    loading,
    submitting,
    onSubmit,
    onCancel
}: ScheduleSessionProps) {
    const [formData, setFormData] = useState({
        skillId: mentorshipRequestSkillId || "",
        scheduledAt: "",
        totalCallDuration: 30
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            ...formData,
            skillId: mentorshipRequestSkillId || formData.skillId,
        })
    }

    if (loading) {
        return (
            <div className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] flex items-center justify-center px-4`} role="status" aria-live="polite">
                <p className="text-sm text-[#a8ab9e]">Loading session details...</p>
            </div>
        )
    }

    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 1)
    const minDateString = minDate.toISOString().slice(0, 16)

    return (
        <div className={`${DM_Sans_Font.className} min-h-screen bg-[#090a08] flex items-center justify-center px-4 py-8`}>
            <Card className="w-full max-w-2xl space-y-6 rounded-2xl border border-[#242a1e] bg-[#11140e] p-5 sm:p-7 md:p-9">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-[#f2f0e8] text-xl md:text-2xl font-semibold tracking-tight">
                        Schedule a session
                    </h1>
                    <p className="text-sm leading-relaxed text-[#a8ab9e]">
                        Choose a time for a session with{" "}
                        <span className="font-semibold text-[#c7cabf]">
                            {mentor.name}
                        </span>
                    </p>
                </div>

                <Separator className="bg-[#242a1e]" />

                <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-6 md:space-y-8">

                    {/* Mentor Info */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-sm font-medium text-[#c7cabf]">
                            Mentor
                        </Label>
                        <div className="rounded-xl border border-[#242a1e] bg-[#0d0f0b] px-4 py-3">
                            <p className="text-sm font-medium text-[#f2f0e8]">
                                {mentor.name}
                            </p>
                        </div>
                    </div>

                    <Separator className="bg-[#242a1e]" />

                    {/* Skill + Duration Row */}
                    <div className="grid md:grid-cols-2 gap-5">

                        {/* Skill */}
                        <div className="space-y-2 md:space-y-3">
                            <Label htmlFor="skillId" className="text-sm font-medium text-[#c7cabf]">
                                Select skill <span className="text-[#f4b8bc]">*</span>
                            </Label>
                            <select
                                id="skillId"
                                value={mentorshipRequestSkillId || formData.skillId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        skillId: e.target.value
                                    })
                                }
                                className="h-11 w-full rounded-xl border border-[#283022] bg-[#0d0f0b] px-3 text-sm text-[#f2f0e8] [color-scheme:dark] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 disabled:cursor-not-allowed disabled:opacity-60"
                                required
                                disabled={submitting || !!mentorshipRequestSkillId}
                            >
                                <option value="">Select...</option>
                                {mentor.skillsOffered.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                            {mentorshipRequestSkillId && (
                                <p className="text-xs text-[#a8ab9e]">
                                    Skill locked based on your mentorship request
                                </p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="space-y-2 md:space-y-3">
                            <Label htmlFor="duration" className="text-sm font-medium text-[#c7cabf]">
                                Duration
                            </Label>
                            <select
                                id="duration"
                                value={formData.totalCallDuration}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        totalCallDuration: Number(e.target.value)
                                    })
                                }
                                className="h-11 w-full rounded-xl border border-[#283022] bg-[#0d0f0b] px-3 text-sm text-[#f2f0e8] [color-scheme:dark] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
                                disabled={submitting}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                            </select>
                            {/* <p className="text-xs text-muted-foreground">
                                Maximum 30 minutes
                            </p> */}
                        </div>
                    </div>

                    {/* <Separator /> */}

                    {/* Date & Time */}
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="scheduledAt" className="text-sm font-medium text-[#c7cabf]">
                            Preferred date and time{" "}
                            <span className="text-[#f4b8bc]">*</span>
                        </Label>
                        <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    scheduledAt: e.target.value
                                })
                            }
                            className="auth-input h-11 rounded-xl border-[#283022] bg-[#0d0f0b] text-[#f2f0e8] [color-scheme:dark] caret-[#9eb660] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/25"
                            min={minDateString}
                            required
                            disabled={submitting}
                        />
                        {/* <p className="text-xs text-muted-foreground">
                            Must be scheduled at least 1 hour in advance
                        </p> */}
                    </div>

                    {/* <Separator /> */}

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-11 flex-1 cursor-pointer rounded-xl bg-[#8fa654] text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Sending request..." : "Send request"}
                        </Button>

                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="h-11 flex-1 cursor-pointer rounded-xl border border-[#3a4530] bg-transparent text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] active:bg-[#242a1e] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </Button>

                    </div>
                </form>
            </Card>
        </div>
    )
}
