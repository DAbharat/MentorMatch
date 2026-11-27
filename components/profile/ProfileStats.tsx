"use client";

import React from "react";
import { DM_Sans } from "next/font/google";
import { Star } from "lucide-react";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type ProfileStatsProps = {
  stats: {
    sessionsCompletedAsMentor: number;
    sessionsCompletedAsMentee: number;
    averageRating: number | null;
    ratingCount: number;
  };
};

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) {
    return (
      <p className={`text-sm text-[#8a8f80] py-4 ${DM_Sans_Font.className}`}>
        No stats available for this user.
      </p>
    );
  }

  const hasStats =
    stats.sessionsCompletedAsMentor > 0 ||
    stats.sessionsCompletedAsMentee > 0 ||
    stats.ratingCount > 0;

  if (!hasStats) {
    return (
      <div className={`py-4 ${DM_Sans_Font.className}`}>
        <p className="text-sm font-medium text-[#f2f0e8]">
          No completed sessions yet
        </p>
        <p className="text-sm text-[#8a8f80] mt-1">
          Session counts and peer ratings will appear here once a session finishes.
        </p>
      </div>
    );
  }

  const totalSessions =
    stats.sessionsCompletedAsMentor + stats.sessionsCompletedAsMentee;

  const rating = stats.averageRating ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div
      className={`w-full grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1e2419] border-y border-[#1e2419] ${DM_Sans_Font.className}`}
    >
      {/* Sessions */}
      <div className="py-5 sm:pr-6">
        <p className="text-sm text-[#8a8f80]">Sessions completed</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-[#f2f0e8] tabular-nums">
          {totalSessions}
        </p>
        <p className="mt-2 text-xs text-[#a8ab9e] tabular-nums">
          {stats.sessionsCompletedAsMentor} as mentor ·{" "}
          {stats.sessionsCompletedAsMentee} as mentee
        </p>
      </div>

      {/* Average Rating */}
      <div className="py-5 sm:px-6">
        <p className="text-sm text-[#8a8f80]">Average rating</p>
        {stats.averageRating !== null ? (
          <>
            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="text-3xl font-bold tracking-tight text-[#f2f0e8] tabular-nums">
                {stats.averageRating.toFixed(1)}
              </p>
              <span className="text-sm text-[#8a8f80]">/ 5.0</span>
            </div>
            <div
              className="mt-2.5 flex gap-1"
              aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  aria-hidden="true"
                  className={
                    i < fullStars
                      ? "fill-amber-400 text-amber-400"
                      : i === fullStars && hasHalf
                      ? "fill-amber-400/50 text-amber-400"
                      : "text-[#2a3322]"
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#8a8f80]">No ratings yet</p>
        )}
      </div>

      {/* Total Ratings */}
      <div className="py-5 sm:pl-6">
        <p className="text-sm text-[#8a8f80]">Peer reviews</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-[#f2f0e8] tabular-nums">
          {stats.ratingCount}
        </p>
        <p className="mt-2 text-xs text-[#a8ab9e]">
          Feedback submitted after sessions
        </p>
      </div>
    </div>
  );
}
