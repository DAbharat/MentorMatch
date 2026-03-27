"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/retroui/Button"
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
    loading: boolean
    onSubmit: (formData: {
        skillId: string
        scheduledAt: string
        totalCallDuration: number
    }) => void
    onCancel: () => void
}

export default function ScheduleSession({
    mentor,
    mentorshipRequestSkillId,
    loading,
    onSubmit,
    onCancel
}: ScheduleSessionProps) {
    const [formData, setFormData] = useState({
        skillId: mentorshipRequestSkillId || "",
        scheduledAt: "",
        totalCallDuration: 30
    })

    // Update skillId when mentorshipRequestSkillId is loaded
    useEffect(() => {
        if (mentorshipRequestSkillId) {
            setFormData(prev => ({
                ...prev,
                skillId: mentorshipRequestSkillId
            }))
        }
    }, [mentorshipRequestSkillId])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    if (loading) {
        return (
            <div className={`${DM_Sans_Font.className} flex items-center justify-center min-h-screen`}>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 1)
    const minDateString = minDate.toISOString().slice(0, 16)

    return (
        <div className={`${DM_Sans_Font.className} min-h-screen flex items-center justify-center px-4 py-8`}>
            <Card className="w-full max-w-2xl p-6 md:p-10 lg:p-12 rounded-2xl shadow-lg bg-[#111315] border-[#1f1f1f]">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-[#d3d3d3] text-xl md:text-2xl font-semibold tracking-tight">
                        Schedule Session
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Request a mentorship session with{" "}
                        <span className="font-semibold text-muted-foreground">
                            {mentor.name}
                        </span>
                    </p>
                </div>

                <Separator className="bg-[#1f1f1f]"/>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

                    {/* Mentor Info */}
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-xs uppercase tracking-wide text-[#d3d3d3]">
                            Mentor
                        </Label>
                        <div className="rounded-lg border border-gray-500 px-4 py-3 bg-transparent">
                            <p className="text-sm font-medium text-[#d3d3d3]">
                                {mentor.name}
                            </p>
                        </div>
                    </div>

                    <Separator className="bg-[#1f1f1f]"/>

                    {/* Skill + Duration Row */}
                    <div className="grid md:grid-cols-2 gap-5">

                        {/* Skill */}
                        <div className="space-y-2 md:space-y-3 text-[#d3d3d3]">
                            <Label htmlFor="skillId">
                                Select Skill <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="skillId"
                                value={formData.skillId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        skillId: e.target.value
                                    })
                                }
                                className="w-full px-3 py-2 border border-[#1f1f1f] rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-transparent text-muted-foreground disabled:cursor-not-allowed"
                                required
                                disabled={!!mentorshipRequestSkillId}
                            >
                                <option value="">Select...</option>
                                {mentor.skillsOffered.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                            {mentorshipRequestSkillId && (
                                <p className="text-xs text-muted-foreground">
                                    Skill locked based on your mentorship request
                                </p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="space-y-2 md:space-y-3 text-[#d3d3d3]">
                            <Label htmlFor="duration">
                                Duration (minutes)
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
                                className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-muted-foreground"
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
                    <div className="space-y-2 md:space-y-3 text-[#d3d3d3]">
                        <Label htmlFor="scheduledAt">
                            Preferred Date & Time{" "}
                            <span className="text-red-500">*</span>
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
                            className="border border-gray-500"
                            min={minDateString}
                            required
                        />
                        {/* <p className="text-xs text-muted-foreground">
                            Must be scheduled at least 1 hour in advance
                        </p> */}
                    </div>

                    {/* <Separator /> */}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        
                        <Button
                            type="submit"
                            className="flex-1 bg-white text-black hover:bg-gray-400 rounded-full"
                        >
                            Send Request
                        </Button>

                        <Button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-transparent text-white rounded-full border border-white/40"
                        >
                            Cancel
                        </Button>

                    </div>
                </form>
            </Card>
        </div>
    )
}
