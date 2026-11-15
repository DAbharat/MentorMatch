import React from "react";
import { TrendingUp, Star, Award } from "lucide-react";
import { RatingDistribution } from "@/types/analytics";

interface RatingAndImpactProps {
    averageRating: number | null;
    totalReviews: number;
    distribution: RatingDistribution;
    averageConfidenceGain: number | null;
}

export default function RatingAndImpact({
    averageRating,
    totalReviews,
    distribution,
    averageConfidenceGain,
}: RatingAndImpactProps) {
    const starLevels = [5, 4, 3, 2, 1];

    const hasConfidenceData = averageConfidenceGain !== null && !isNaN(averageConfidenceGain);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Mentee Impact */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#111214] border border-[#25272A] h-full">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-[#00D6A0]" />
                        <h3 className="text-base font-semibold text-[#F5F5F5]">Mentee Impact</h3>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-[#F5F5F5]">Confidence Improvement</h4>
                        <p className="text-xs text-[#9299A3] leading-relaxed">
                            Measured before vs after mentoring sessions based on student self-assessments.
                        </p>
                    </div>

                    <div className="my-6">
                        {hasConfidenceData ? (
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-4xl sm:text-5xl font-bold text-[#00D6A0] tracking-tight">
                                    {averageConfidenceGain > 0 ? `+${averageConfidenceGain.toFixed(1)}` : `${averageConfidenceGain.toFixed(1)}`}
                                </span>
                                <span className="text-xs text-[#9299A3]">
                                    Points on a 5-point scale.
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <div className="text-4xl sm:text-5xl font-bold text-[#9299A3] tracking-tight">
                                    --
                                </div>
                                <p className="text-xs text-[#9299A3]">
                                    Not enough assessment data yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preserved Horizontal Feedback Box */}
                <div className="p-3.5 rounded-xl bg-[#17191C] border border-[#25272A] text-xs flex items-center gap-2.5 mt-auto">
                    <Award className="w-5 h-5 shrink-0 text-[#00D6A0]" />
                    <span className="text-[#9299A3]">
                        {hasConfidenceData && averageConfidenceGain > 1.5
                            ? "Your sessions consistently deliver tangible skill progression!"
                            : "Keep conducting sessions to boost student confidence metrics."}
                    </span>
                </div>
            </div>

            {/* Right Card: Review Breakdown */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#111214] border border-[#25272A] h-full">
                <div>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-base font-semibold text-[#F5F5F5]">Review Breakdown</h3>
                            <p className="text-xs text-[#9299A3] mt-0.5">
                                {totalReviews > 0
                                    ? `${totalReviews} verified student review${totalReviews === 1 ? "" : "s"}.`
                                    : "No reviews yet."}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#17191C] border border-[#25272A]">
                            <span className="text-lg font-bold text-[#F5F5F5]">
                                {averageRating ? averageRating.toFixed(1) : "0.0"}
                            </span>
                            <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                        </div>
                    </div>

                    {/* 5-Star Distribution Bars */}
                    <div className="space-y-2.5 mt-4">
                        {starLevels.map((stars) => {
                            const count = distribution[stars] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={stars} className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1 w-7 text-[#9299A3] shrink-0 font-medium">
                                        <span>{stars}</span>
                                        <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
                                    </div>
                                    <div className="flex-1 h-2 rounded-full bg-[#292B2E] overflow-hidden">
                                        <div
                                            className="h-full bg-[#FFC107] rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right text-[#9299A3] tabular-nums shrink-0">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
