"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { fetchMentorAnalytics } from "@/services/analytics.service";
import { MentorAnalyticsResponse } from "@/types/analytics";
import AnalyticsKPIs from "@/components/analytics/AnalyticsKPIs";
import RatingAndImpact from "@/components/analytics/RatingAndImpact";
import ActivityAndSkills from "@/components/analytics/ActivityAndSkills";
import RecentReviewsList from "@/components/analytics/RecentReviewsList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

function AnalyticsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`min-h-screen bg-[#090a08] py-8 sm:py-10 ${DM_Sans_Font.className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#242a1e]">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52 bg-[#1b2116]" />
            <Skeleton className="h-4 w-72 bg-[#161b12]" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl bg-[#161b12]" />
        </div>

        <Skeleton className="h-28 w-full rounded-2xl bg-[#11140e] border border-[#242a1e]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Skeleton className="lg:col-span-8 h-80 rounded-2xl bg-[#11140e] border border-[#242a1e]" />
          <Skeleton className="lg:col-span-4 h-80 rounded-2xl bg-[#11140e] border border-[#242a1e]" />
        </div>

        <Skeleton className="h-56 w-full rounded-2xl bg-[#11140e] border border-[#242a1e]" />
        <p className="text-sm text-[#a8ab9e]">Loading mentor analytics...</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { userId, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<MentorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(
    null
  );

  const loadAnalytics = useCallback(async (background = false) => {
    try {
      if (background) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await fetchMentorAnalytics();
      setData(res);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load mentor analytics";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !userId) {
      toast.error("Please sign in to view analytics");
      router.push("/sign-in");
      return;
    }

    if (userId) {
      loadAnalytics(false);
    }
  }, [userId, authLoading, router, loadAnalytics]);

  if (authLoading || loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <div
        className={`min-h-screen bg-[#090a08] flex items-center justify-center px-4 ${DM_Sans_Font.className}`}
      >
        <div className="max-w-md w-full bg-[#11140e] border border-[#5d6a4f] rounded-2xl p-6 space-y-4">
          <div className="rounded-xl border border-[#8e3b42] bg-[#231214] p-4 flex items-start gap-2.5">
            <AlertCircle
              className="w-4 h-4 text-[#eb7b83] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-[#f4b8bc]">
                Could not load mentor analytics
              </p>
              <p className="text-xs text-[#f4b8bc] mt-1">
                {error || "Please try refreshing your analytics data."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => loadAnalytics(false)}
            className="w-full h-11 bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8fa654]"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const totalScheduledPool =
    data.overview.totalCompletedSessions + data.overview.cancelledSessionsCount;
  const completionRate =
    totalScheduledPool > 0
      ? Math.round(
          (data.overview.totalCompletedSessions / totalScheduledPool) * 100
        )
      : null;

  return (
    <div
      className={`min-h-screen bg-[#090a08] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8] py-8 sm:py-10 pb-16 ${DM_Sans_Font.className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Workbench Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#242a1e]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f2f0e8] tracking-tight">
              Mentor Analytics
            </h1>
            <p className="text-sm text-[#a8ab9e] mt-1 tabular-nums">
              {data.overview.upcomingSessionsCount} upcoming session
              {data.overview.upcomingSessionsCount === 1 ? "" : "s"}
              {completionRate !== null
                ? ` · ${completionRate}% session completion rate`
                : " · Session performance and mentee impact"}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => loadAnalytics(true)}
            disabled={isRefreshing}
            className="h-11 px-4 rounded-xl bg-[#11140e] border border-[#5d6a4f] text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#8fa654] active:bg-[#1b2116] font-medium text-sm transition-colors motion-reduce:transition-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#b7cc7e] ${
                isRefreshing ? "animate-spin motion-reduce:animate-none" : ""
              }`}
              aria-hidden="true"
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </header>

        {/* Unified 4-Column Tabular KPI Ledger */}
        <AnalyticsKPIs overview={data.overview} />

        {/* Primary Analytical Grid: Trend Chart + Impact & Star Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8">
            <ActivityAndSkills
              mode="chart-only"
              monthlyTrends={data.monthlyTrends}
              skillsBreakdown={data.skillsBreakdown}
            />
          </div>
          <div className="lg:col-span-4">
            <RatingAndImpact
              averageRating={data.overview.averageRating}
              totalReviews={data.overview.totalReviewsCount}
              distribution={data.ratingDistribution}
              averageConfidenceGain={data.overview.averageConfidenceGain}
              selectedStarFilter={selectedStarFilter}
              onSelectStarFilter={setSelectedStarFilter}
            />
          </div>
        </div>

        {/* Sortable Skills Performance Table */}
        <ActivityAndSkills
          mode="table-only"
          monthlyTrends={data.monthlyTrends}
          skillsBreakdown={data.skillsBreakdown}
        />

        {/* Filterable Student Feedback Log */}
        <RecentReviewsList
          reviews={data.recentFeedback}
          selectedStarFilter={selectedStarFilter}
          onClearStarFilter={() => setSelectedStarFilter(null)}
        />
      </div>
    </div>
  );
}
