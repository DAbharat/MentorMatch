import React from 'react'
import { DM_Sans } from 'next/font/google'
import { Card } from '@/components/ui/card'

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type Feedback = {
    id: string
    rating: number
    comment: string
    createdAt?: Date | string
    skill: {
        id: string
        name: string
    }
    mentee: {
        id: string
        name: string
    }
}

type ProfileFeedbackProps = {
    feedbacks: Feedback[]
}

export default function ProfileFeedback({ feedbacks }: ProfileFeedbackProps) {
    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className={`p-6 rounded-xl text-center ${DM_Sans_Font.className}`}>
                <p className="text-sm text-muted-foreground">
                    No feedback available yet!
                </p>
            </div>
        )
    }

    const formatDate = (date?: Date | string) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className={`w-full max-w-2xl mx-auto space-y-3 px-4 ${DM_Sans_Font.className}`}>
            {feedbacks.map((fb) => (
                <Card
                    key={fb.id}
                    className="bg-[#111315] border-[#1f1f1f] p-4 rounded-xl"
                >
                    <div className="flex gap-3">
                        {/* Mentee Avatar */}
                        <div className="shrink-0 pt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-sm font-semibold shadow-md">
                                {fb.mentee.name.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Mentee Name + Date */}
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-[#d3d3d3] truncate">
                                    {fb.mentee.name}
                                </h3>
                                {fb.createdAt && (
                                    <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                        {formatDate(fb.createdAt)}
                                    </p>
                                )}
                            </div>

                            {/* Skill */}
                            <p className="text-xs text-muted-foreground">
                                for the skill: <span className="font-semibold">{fb.skill.name}</span>
                            </p>

                            {/* Comment */}
                            <p className="text-sm text-[#d3d3d3] leading-relaxed">
                                {fb.comment}
                            </p>

                            {/* Rating */}
                            <div className="flex gap-0.5 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-sm ${star <= fb.rating ? "text-yellow-400" : "text-gray-500"}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}