"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
            <div className={`${DM_Sans_Font.className} flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-[#090a08] px-4 md:min-h-[calc(100dvh-4rem)]`} role="status" aria-live="polite">
                <p className="text-sm text-[#a8ab9e]">Loading session details...</p>
            </div>
        )
    }

    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 1)
    const minDateString = minDate.toISOString().slice(0, 16)

    return (
        <div className={`${DM_Sans_Font.className} flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center bg-[#090a08] px-4 py-4 md:min-h-[calc(100dvh-4rem)] sm:py-6`}>
            <Card className="w-full max-w-2xl rounded-2xl border border-[#242a1e] bg-[#11140e] p-4 sm:p-5 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-[#f2f0e8] sm:text-2xl">
                        Schedule a session
                    </h1>
                    <p className="text-sm leading-relaxed text-[#a8ab9e]">
                        Choose a time for a session with{" "}
                        <span className="font-semibold text-[#c7cabf]">
                            {mentor.name}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#242a1e] bg-[#0d0f0b] px-3 py-2.5">
                        <span className="text-xs font-medium text-[#a8ab9e]">Mentor</span>
                        <p className="text-sm font-semibold text-[#f2f0e8]">{mentor.name}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                        <div className="space-y-1.5">
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
                                className="h-11 w-full cursor-pointer rounded-xl border border-[#283022] bg-[#0d0f0b] px-3 text-sm text-[#f2f0e8] [color-scheme:dark] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 disabled:cursor-not-allowed disabled:opacity-60"
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

                        <div className="space-y-1.5">
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
                                className="h-11 w-full cursor-pointer rounded-xl border border-[#283022] bg-[#0d0f0b] px-3 text-sm text-[#f2f0e8] [color-scheme:dark] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={submitting}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
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
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-11 w-full cursor-pointer rounded-xl bg-[#8fa654] text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-40"
                        >
                            {submitting ? "Sending request..." : "Send request"}
                        </Button>

                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="h-11 w-full cursor-pointer rounded-xl border border-[#3a4530] bg-transparent text-[#c7cabf] hover:bg-[#1b2116] hover:text-[#f2f0e8] active:bg-[#242a1e] focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-32"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
