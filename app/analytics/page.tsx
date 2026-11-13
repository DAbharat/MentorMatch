"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { fetchMentorAnalytics } from "@/services/analytics.service";
import { MentorAnalyticsResponse } from "@/types/analytics";
import AnalyticsKPIs from "@/components/analytics/AnalyticsKPIs";
import RatingAndImpact from "@/components/analytics/RatingAndImpact";
import ActivityAndSkills from "@/components/analytics/ActivityAndSkills";
import RecentReviewsList from "@/components/analytics/RecentReviewsList";
import { Spinner } from "@/components/ui/spinner";
import { BarChart3 } from "lucide-react";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

export default function AnalyticsPage() {
    const router = useRouter();
    const { userId, isLoading: authLoading } = useAuth();

    const [data, setData] = useState<MentorAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !userId) {
            toast.error("Please sign in to view analytics");
            router.push("/sign-in");
            return;
        }

        if (userId) {
            loadAnalytics();
        }
    }, [userId, authLoading, router]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetchMentorAnalytics();
            setData(res);
        } catch (error: any) {
            toast.error(error.message || "Failed to load mentor analytics");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={`min-h-screen bg-[#0b090a] flex items-center justify-center ${DM_Sans_Font.className}`}>
                <Spinner />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`min-h-screen bg-[#0b090a] text-white p-4 sm:p-6 lg:p-8 ${DM_Sans_Font.className}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                {/* <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mentor Analytics</h1>
                        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                            Track your session performance, student reviews, and learning impact
                        </p>
                    </div>
                </div> */}

                {/* 1. KPIs */}
                <AnalyticsKPIs overview={data.overview} />

                {/* 2. Rating & Confidence Boost */}
                <RatingAndImpact
                    averageRating={data.overview.averageRating}
                    totalReviews={data.overview.totalReviewsCount}
                    distribution={data.ratingDistribution}
                    averageConfidenceGain={data.overview.averageConfidenceGain}
                />

                {/* 3. Monthly Activity & Skills Breakdown */}
                <ActivityAndSkills
                    monthlyTrends={data.monthlyTrends}
                    skillsBreakdown={data.skillsBreakdown}
                />

                {/* 4. Recent Reviews */}
                <RecentReviewsList reviews={data.recentFeedback} />
            </div>
        </div>
    );
}

