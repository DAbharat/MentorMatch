"use client";

import React from "react";
import { MentorAnalyticsOverview } from "@/types/analytics";

interface AnalyticsKPIsProps {
  overview: MentorAnalyticsOverview;
}

export default function AnalyticsKPIs({ overview }: AnalyticsKPIsProps) {
  const avgMinutesPerSession =
    overview.totalCompletedSessions > 0 && overview.totalActiveMinutes > 0
      ? Math.round(overview.totalActiveMinutes / overview.totalCompletedSessions)
      : null;

  const totalScheduled =
    overview.totalCompletedSessions + overview.cancelledSessionsCount;
  const completionRate =
    totalScheduled > 0
      ? Math.round((overview.totalCompletedSessions / totalScheduled) * 100)
      : null;

  const metrics = [
    {
      label: "Completed sessions",
      value: String(overview.totalCompletedSessions),
      sub: `${overview.upcomingSessionsCount} upcoming · ${overview.cancelledSessionsCount} cancelled`,
    },
    {
      label: "Active mentoring time",
      value: `${overview.totalActiveHours ?? 0}h`,
      sub:
        avgMinutesPerSession !== null
          ? `${overview.totalActiveMinutes}m total · avg ${avgMinutesPerSession}m / call`
          : `${overview.totalActiveMinutes ?? 0}m recorded`,
    },
    {
      label: "Unique mentees",
      value: String(overview.uniqueMenteesCount ?? 0),
      sub:
        completionRate !== null
          ? `${completionRate}% session completion`
          : "No finished sessions yet",
    },
    {
      label: "Average rating",
      value:
        overview.averageRating !== null
          ? overview.averageRating.toFixed(1)
          : "--",
      suffix: overview.averageRating !== null ? "/ 5.0" : undefined,
      sub:
        overview.totalReviewsCount > 0
          ? `Across ${overview.totalReviewsCount} review${
              overview.totalReviewsCount === 1 ? "" : "s"
            }`
          : "No reviews submitted yet",
    },
  ];

  return (
    <section
      aria-label="Key mentoring metrics"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#242a1e]"
    >
      {metrics.map((metric, idx) => (
        <div
          key={metric.label}
          className={`p-5 sm:p-6 ${
            idx >= 2 ? "sm:border-t lg:border-t-0 sm:border-[#242a1e]" : ""
          }`}
        >
          <p className="text-xs font-medium text-[#a8ab9e]">{metric.label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold text-[#f2f0e8] tracking-tight tabular-nums">
              {metric.value}
            </p>
            {metric.suffix && (
              <span className="text-xs font-medium text-[#8a8f80]">
                {metric.suffix}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-[#8a8f80] tabular-nums">
            {metric.sub}
          </p>
        </div>
      ))}
    </section>
  );
}
