import React from "react";
import { Star, MessageSquareQuote, ArrowRight } from "lucide-react";
import { AnalyticsFeedback } from "@/types/analytics";
import { Badge } from "@/components/ui/badge";

interface RecentReviewsListProps {
    reviews: AnalyticsFeedback[];
}

export default function RecentReviewsList({ reviews }: RecentReviewsListProps) {
    if (reviews.length === 0) {
        return (
            <div className="p-8 rounded-xl bg-[#111315] border border-[#1f1f1f] text-center">
                <MessageSquareQuote className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <h4 className="text-white font-medium text-sm">No reviews received yet</h4>
                <p className="text-xs text-neutral-500 mt-1">
                    Student feedback will show up here after completed mentoring calls.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-xl bg-[#111315] border border-[#1f1f1f]">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Recent Student Feedback</h3>
                <span className="text-xs text-neutral-400">Showing latest {reviews.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                    <div
                        key={rev.id}
                        className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col justify-between gap-3"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-semibold text-sm text-neutral-200">
                                    {rev.mentee.name}
                                </span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${
                                                i < rev.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-neutral-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-neutral-300 italic line-clamp-3">
                                &quot;{rev.comment}&quot;
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                            <Badge variant="outline" className="border-neutral-800 text-neutral-400 text-[10px]">
                                {rev.skill.name}
                            </Badge>

                            {rev.confidenceBefore !== null && rev.confidenceAfter !== null && (
                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
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

