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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Confidence Impact Spotlight */}
            <div className="flex flex-col justify-between p-6 rounded-xl bg-gradient-to-br from-[#111315] via-[#111315] to-[#181d24] border border-[#1f1f1f]">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                        <TrendingUp className="w-4 h-4" />
                        <span>Mentee Growth Impact</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Average Confidence Boost</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                        Measured before vs after calls based on student self-assessments
                    </p>

                    <div className="flex items-baseline gap-3 my-6">
                        <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight">
                            {averageConfidenceGain !== null ? `+${averageConfidenceGain}` : "--"}
                        </span>
                        <span className="text-neutral-400 text-sm font-medium">
                            points on a 5-point scale
                        </span>
                    </div>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5">
                    <Award className="w-5 h-5 shrink-0" />
                    <span>
                        {averageConfidenceGain && averageConfidenceGain > 1.5
                            ? "Your sessions consistently deliver tangible skill progression!"
                            : "Keep conducting sessions to boost student confidence metrics."}
                    </span>
                </div>
            </div>

            {/* Star Rating Breakdown */}
            <div className="p-6 rounded-xl bg-[#111315] border border-[#1f1f1f]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Review Breakdown</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {totalReviews} verified student reviews
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white flex items-center gap-1 justify-end">
                            {averageRating ? averageRating.toFixed(1) : "0.0"}
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    {starLevels.map((stars) => {
                        const count = distribution[stars] || 0;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                        return (
                            <div key={stars} className="flex items-center gap-3 text-xs">
                                <span className="w-8 text-neutral-400 flex items-center gap-1 font-medium">
                                    {stars} <Star className="w-3 h-3 text-neutral-500" />
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-neutral-400 tabular-nums">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

