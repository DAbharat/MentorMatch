import React from "react";
import { Star, MessageSquareQuote, ArrowRight } from "lucide-react";
import { AnalyticsFeedback } from "@/types/analytics";

interface RecentReviewsListProps {
    reviews: AnalyticsFeedback[];
}

export default function RecentReviewsList({ reviews }: RecentReviewsListProps) {
    if (reviews.length === 0) {
        return (
            <div className="p-8 rounded-2xl bg-[#111214] border border-[#25272A] text-center">
                <MessageSquareQuote className="w-8 h-8 text-[#9299A3] opacity-40 mx-auto mb-2" />
                <h4 className="text-[#F5F5F5] font-medium text-sm">No reviews received yet</h4>
                <p className="text-xs text-[#9299A3] mt-1">
                    Student feedback will show up here after completed mentoring calls.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-[#111214] border border-[#25272A]">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-[#F5F5F5]">Recent Student Feedback</h3>
                <span className="text-xs text-[#9299A3]">Showing latest {reviews.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                    <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-[#17191C] border border-[#25272A] hover:border-[#2f3236] transition-colors flex flex-col justify-between gap-3"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-semibold text-sm text-[#F5F5F5]">
                                    {rev.mentee.name}
                                </span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${
                                                i < rev.rating
                                                    ? "fill-[#FFC107] text-[#FFC107]"
                                                    : "text-[#292B2E]"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-[#F5F5F5] opacity-90 italic line-clamp-3 leading-relaxed">
                                &quot;{rev.comment}&quot;
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-[#25272A] text-[11px] text-[#9299A3]">
                            <span className="px-2 py-0.5 rounded-md bg-[#292B2E] text-[10px] text-[#9299A3]">
                                {rev.skill.name}
                            </span>

                            {rev.confidenceBefore !== null && rev.confidenceAfter !== null && (
                                <span className="flex items-center gap-1 text-[#00D6A0] font-medium">
                                    Confidence: {rev.confidenceBefore} <ArrowRight className="w-2.5 h-2.5" /> {rev.confidenceAfter}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
