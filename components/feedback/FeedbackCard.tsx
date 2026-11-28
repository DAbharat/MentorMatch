"use client"

import React from 'react'
import { Card } from '../ui/card'
import { Star } from 'lucide-react'

type FeedbackCardProps = {
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
    comment: string;
    rating: number;
    createdAt?: Date | string;
}

export default function FeedbackCard({
    id,
    sessionId,
    mentor,
    mentee,
    skill,
    comment,
    rating,
    createdAt
}: FeedbackCardProps) {
    const createdDate = createdAt ? new Date(createdAt) : null;
    const dateTime = createdDate && !Number.isNaN(createdDate.getTime())
        ? createdDate.toISOString()
        : null;

    const formatDate = (date?: Date | string) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (Number.isNaN(dateObj.getTime())) return '';
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full">
            <Card className="rounded-2xl border border-[#242a1e] bg-[#11140e] p-4 sm:p-5">
                
                <div className="flex items-start gap-3 sm:gap-4">
                    
                    {/* Mentee Avatar */}
                    <div className="shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#3a4530] bg-[#161b12] text-base font-semibold text-[#b7cc7e] sm:h-12 sm:w-12">
                            {mentee.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2">
                        
                        {/* Mentee Name + Date */}
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <h3 className="text-sm font-semibold text-[#f2f0e8] sm:text-base">
                                {mentee.name}
                            </h3>
                            {dateTime && (
                                <time dateTime={dateTime} className="text-xs text-[#a8ab9e]">
                                    {formatDate(createdAt)}
                                </time>
                            )}
                        </div>

                        {/* Skill */}
                        <p className="text-sm text-[#a8ab9e]">
                            Feedback on{" "}
                            <span className="font-medium text-[#c7cabf]">
                                {skill.name}
                            </span>
                        </p>

                        {/* Comment */}
                        <p className="break-words text-sm leading-relaxed text-[#c7cabf]">
                            {comment}
                        </p>

                        {/* Rating */}
                        <div className="flex gap-1 pt-1" role="img" aria-label={`${rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#8e9484]"}`}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}