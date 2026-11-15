import React from "react";
import { Video, Clock, Users, Star } from "lucide-react";
import { MentorAnalyticsOverview } from "@/types/analytics";

interface AnalyticsKPIsProps {
    overview: MentorAnalyticsOverview;
}

export default function AnalyticsKPIs({ overview }: AnalyticsKPIsProps) {
    const stats = [
        {
            label: "Sessions",
            value: overview.totalCompletedSessions,
            subtitle: "Completed mentoring sessions.",
            icon: <Video className="w-5 h-5 text-[#9299A3]" />,
        },
        {
            label: "Mentoring time",
            value: `${overview.totalActiveHours ?? 0}h`,
            subtitle: "Total active mentoring time.",
            icon: <Clock className="w-5 h-5 text-[#00D6A0]" />,
        },
        {
            label: "Mentees",
            value: overview.uniqueMenteesCount ?? 0,
            subtitle: "Unique students mentored.",
            icon: <Users className="w-5 h-5 text-[#B78AFF]" />,
        },
        {
            label: "Average rating",
            value: overview.averageRating ? overview.averageRating.toFixed(1) : "N/A",
            subtitle: overview.totalReviewsCount > 0
                ? `Based on ${overview.totalReviewsCount} review${overview.totalReviewsCount === 1 ? "" : "s"}.`
                : "No reviews yet.",
            icon: <Star className="w-5 h-5 text-[#FFC107] fill-[#FFC107]" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-[#111214] border border-[#25272A] hover:border-[#2f3236] transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#9299A3]">
                            {item.label}
                        </span>
                        <div className="p-2 rounded-lg bg-[#17191C] border border-[#25272A]">
                            {item.icon}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
                            {item.value}
                        </div>
                        <p className="text-xs text-[#9299A3] mt-1">
                            {item.subtitle}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
