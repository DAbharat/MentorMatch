import React from "react";
import { Video, Clock, Users, Star } from "lucide-react";
import { MentorAnalyticsOverview } from "@/types/analytics";

interface AnalyticsKPIsProps {
    overview: MentorAnalyticsOverview;
}

export default function AnalyticsKPIs({ overview }: AnalyticsKPIsProps) {
    const stats = [
        {
            label: "Sessions Completed",
            value: overview.totalCompletedSessions,
            subtext: `${overview.upcomingSessionsCount} upcoming / confirmed`,
            icon: <Video className="w-5 h-5 text-blue-400" />,
        },
        {
            label: "Total Mentoring Time",
            value: `${overview.totalActiveHours} hrs`,
            subtext: `${overview.totalActiveMinutes} minutes active`,
            icon: <Clock className="w-5 h-5 text-emerald-400" />,
        },
        {
            label: "Mentees Helped",
            value: overview.uniqueMenteesCount,
            subtext: "Unique students mentored",
            icon: <Users className="w-5 h-5 text-purple-400" />,
        },
        {
            label: "Average Rating",
            value: overview.averageRating ? `${overview.averageRating} ★` : "N/A",
            subtext: `Based on ${overview.totalReviewsCount} reviews`,
            icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between gap-3 p-5 rounded-xl bg-[#111315] border border-[#1f1f1f] hover:border-[#2a2f34] transition-all duration-200"
                >
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            {item.label}
                        </span>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                            {item.icon}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {item.value}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{item.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

