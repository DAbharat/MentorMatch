"use client"

import React, { useState } from "react"
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
    React.useEffect(() => {
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
            <Card className="w-full max-w-3xl p-6 md:p-8 rounded-2xl shadow-lg">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                        Schedule Session
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Request a mentorship session with{" "}
                        <span className="font-medium text-foreground">
                            {mentor.name}
                        </span>
                    </p>
                </div>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Mentor Info */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Mentor
                        </Label>
                        <div className="rounded-lg border border-border px-4 py-3 bg-muted/30">
                            <p className="text-sm font-medium">
                                {mentor.name}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Skill + Duration Row */}
                    <div className="grid md:grid-cols-2 gap-5">

                        {/* Skill */}
                        <div className="space-y-2">
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
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        <div className="space-y-2">
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
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Maximum 30 minutes
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Date & Time */}
                    <div className="space-y-2">
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
                            min={minDateString}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Must be scheduled at least 1 hour in advance
                        </p>
                    </div>

                    <Separator />

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-black hover:bg-gray-300"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="flex-1 bg-black text-white hover:bg-black/90"
                        >
                            Send Request
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
