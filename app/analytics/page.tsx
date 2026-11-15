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
            <div className={`min-h-screen bg-[#090909] flex items-center justify-center ${DM_Sans_Font.className}`}>
                <Spinner />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`min-h-screen bg-[#090909] text-[#F5F5F5] p-4 sm:p-6 lg:p-8 ${DM_Sans_Font.className}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#25272A]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
                            Mentor Analytics
                        </h1>
                        <p className="text-xs sm:text-sm text-[#9299A3] mt-0.5">
                            Track your mentoring performance and student impact.
                        </p>
                    </div>
                    <span className="text-xs font-medium text-[#9299A3] px-3 py-1 rounded-full bg-[#17191C] border border-[#25272A]">
                        Overview
                    </span>
                </div>

                {/* Row 1: Four statistics cards */}
                <AnalyticsKPIs overview={data.overview} />

                {/* Row 2: Mentee Impact (left) & Review Breakdown (right) */}
                <RatingAndImpact
                    averageRating={data.overview.averageRating}
                    totalReviews={data.overview.totalReviewsCount}
                    distribution={data.ratingDistribution}
                    averageConfidenceGain={data.overview.averageConfidenceGain}
                />

                {/* Row 3: Monthly Activity (left) & Top Mentored Skills (right) */}
                <ActivityAndSkills
                    monthlyTrends={data.monthlyTrends}
                    skillsBreakdown={data.skillsBreakdown}
                />

                {/* Row 4: Recent Student Feedback */}
                <RecentReviewsList reviews={data.recentFeedback} />
            </div>
        </div>
    );
}
