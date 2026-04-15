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
            <Card className={`${cardContainerClass} p-6 md:p-10 lg:p-12 rounded-2xl shadow-lg bg-[#111315] border-[#1f1f1f]`}>

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-[#d3d3d3] text-xl md:text-2xl font-semibold tracking-tight">
                        Feedback Form
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Give feedback about your session with{" "}
                        <span className="font-semibold text-muted-foreground">
                            {mentor.name}
                        </span>
                        {" "}for the skill{" "}
                        <span className="font-semibold text-muted-foreground">
                            {skill.name}
                        </span>
                    </p>
                </div>

                <Separator className="bg-[#1f1f1f]" />

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

                    {/* Rating Section */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wide text-[#d3d3d3]">
                            How would you rate this session? <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="text-3xl transition-colors duration-200"
                                >
                                    <span
                                        className={
                                            star <= (hoveredRating || rating)
                                                ? "text-yellow-400"
                                                : "text-gray-500"
                                        }
                                    >
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Rating: {rating} out of 5
                            </p>
                        )}
                    </div>

                    <Separator className="bg-[#1f1f1f]" />

                    {/* Comment Section */}
                    <div className="space-y-3">
                        <Label htmlFor="comment" className="text-xs uppercase tracking-wide text-[#d3d3d3]">
                            Your Feedback
                        </Label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about the session..."
                            className="w-full px-4 py-3 border border-gray-500 rounded-lg bg-transparent text-[#d3d3d3] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                            rows={4}
                        />
                    </div>

                    <Separator className="bg-[#1f1f1f]" />

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="submit"
                            className="flex-1 bg-white text-black hover:bg-gray-400 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
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

