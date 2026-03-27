"use client"

import React from 'react'
import { Card } from '../ui/card'

type FeedbackCardProps = {
    id: string;
    sessionId: string;
    mentor: {
        id: string;
        name: string;
        clerkUserId: string
    },
    mentee: {
        id: string;
        name: string;
        clerkuserId: string;
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
    const formatDate = (date?: Date | string) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full">
            <Card className="bg-[#111315] border-[#1f1f1f] p-3 sm:p-4 md:p-5 rounded-2xl">
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    
                    {/* Mentee Avatar */}
                    <div className="shrink-0 flex justify-center sm:justify-start">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-base sm:text-lg md:text-lg font-semibold shadow-md">
                            {mentee.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1.5 sm:space-y-2 text-center sm:text-left">
                        
                        {/* Mentee Name + Date */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
                            <h3 className="text-sm sm:text-base md:text-base font-semibold text-[#d3d3d3]">
                                {mentee.name}
                            </h3>
                            {createdAt && (
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(createdAt)}
                                </p>
                            )}
                        </div>

                        {/* Skill */}
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            for the skill:{" "}
                            <span className="font-semibold text-muted-foreground">
                                {skill.name}
                            </span>
                        </p>

                        {/* Comment */}
                        <p className="text-xs sm:text-sm text-[#d3d3d3] leading-relaxed pt-1">
                            {comment}
                        </p>

                        {/* Rating */}
                        <div className="flex justify-center sm:justify-start gap-0.5 pt-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-lg ${star <= rating ? "text-yellow-400" : "text-gray-500"}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}