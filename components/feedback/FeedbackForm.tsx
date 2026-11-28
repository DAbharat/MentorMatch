"use client"

import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Separator } from '../ui/separator'
import { Button } from '../retroui/Button'
import { Label } from '../ui/label'
import { DM_Sans } from 'next/font/google'

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type FeddbackFormProps = {
    id: string;
    sessionId: string;
    mentor: {
        id: string;
        name: string;
    },
    mentee: {
        id: string;
        name: string;
    },
    skill: {
        id: string;
        name: string;
    },
    onSubmit?: (formData: { rating: number; comment: string }) => void;
    isModal?: boolean;
    loading?: boolean;
}

export default function FeedbackForm({
    id,
    sessionId,
    mentor,
    mentee,
    skill,
    onSubmit,
    isModal = true,
    loading = false,
}: FeddbackFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSubmit && !loading) {
            onSubmit({ rating, comment })
        }
    }

    const containerClass = isModal 
        ? `${DM_Sans_Font.className}` 
        : `${DM_Sans_Font.className} min-h-screen flex items-center justify-center px-4 py-8`

    const cardContainerClass = isModal
        ? "w-full"
        : "w-full max-w-2xl"

    return (
        <div className={containerClass}>
            <Card className={`${cardContainerClass} rounded-2xl border-[#242a1e] bg-[#11140e] p-6 shadow-none md:p-8`}>

                {/* Header */}
                <div className="space-y-1">
                    <h1 id="feedback-dialog-title" className="text-xl font-semibold tracking-tight text-[#f2f0e8] md:text-2xl">
                        Feedback Form
                    </h1>
                    <p className="text-sm text-[#a8ab9e]">
                        Give feedback about your session with{" "}
                        <span className="font-semibold text-[#c7cabf]">
                            {mentor.name}
                        </span>
                        {" "}for the skill{" "}
                        <span className="font-semibold text-[#c7cabf]">
                            {skill.name}
                        </span>
                    </p>
                </div>

                <Separator className="bg-[#242a1e]" />

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

                    {/* Rating Section */}
                    <div className="space-y-3">
                        <Label id="rating-label" className="text-sm font-medium text-[#c7cabf]">
                            How would you rate this session? <span className="text-red-500">*</span>
                        </Label>
                        <div role="group" aria-labelledby="rating-label" className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`Rate ${star} out of 5`}
                                    aria-pressed={rating === star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-3xl transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa654]"
                                >
                                    <span
                                        className={
                                            star <= (hoveredRating || rating)
                                                ? "text-[#f59e0b]"
                                                : "text-[#8a8f80]"
                                        }
                                    >
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-xs text-[#a8ab9e]">
                                Rating: {rating} out of 5
                            </p>
                        )}
                    </div>

                    <Separator className="bg-[#242a1e]" />

                    {/* Comment Section */}
                    <div className="space-y-3">
                        <Label htmlFor="comment" className="text-sm font-medium text-[#c7cabf]">
                            Your Feedback
                        </Label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about the session..."
                            className="w-full resize-none rounded-xl border border-[#283022] bg-[#0d0f0b] px-4 py-3 text-[#f2f0e8] placeholder:text-[#8a8f80] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                            rows={4}
                        />
                    </div>

                    <Separator className="bg-[#242a1e]" />

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="submit"
                            className="min-h-11 flex-1 rounded-xl bg-[#8fa654] font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading || rating === 0 || comment.trim() === ''}
                        >
                            {loading ? "Submitting..." : "Submit Feedback"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    )
}

