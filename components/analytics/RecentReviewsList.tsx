"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Star, X } from "lucide-react";
import { AnalyticsFeedback } from "@/types/analytics";

interface RecentReviewsListProps {
  reviews: AnalyticsFeedback[];
  selectedStarFilter: number | null;
  onClearStarFilter: () => void;
}

export default function RecentReviewsList({
  reviews,
  selectedStarFilter,
  onClearStarFilter,
}: RecentReviewsListProps) {
  const [skillFilter, setSkillFilter] = useState<string>("all");

  const uniqueSkills = useMemo(() => {
    const names = Array.from(new Set(reviews.map((r) => r.skill.name)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (selectedStarFilter !== null && rev.rating !== selectedStarFilter) {
        return false;
      }
      if (skillFilter !== "all" && rev.skill.name !== skillFilter) {
        return false;
      }
      return true;
    });
  }, [reviews, selectedStarFilter, skillFilter]);

  const hasActiveFilters =
    selectedStarFilter !== null || skillFilter !== "all";

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    if (Number.isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section
      aria-label="Recent student feedback"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl overflow-hidden"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-[#242a1e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#f2f0e8]">
            Recent student feedback
          </h2>
          <p className="text-xs text-[#a8ab9e] mt-0.5 tabular-nums">
            Showing {filteredReviews.length} of {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedStarFilter !== null && (
              <button
                type="button"
                onClick={onClearStarFilter}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#1b2116] border border-[#8fa654] text-xs font-medium text-[#f2f0e8] hover:bg-[#22291c] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
              >
                {selectedStarFilter} star{selectedStarFilter === 1 ? "" : "s"}
                <X className="w-3.5 h-3.5 text-[#b7cc7e]" aria-hidden="true" />
              </button>
            )}

            {uniqueSkills.length > 1 && (
              <div className="flex items-center">
                <label htmlFor="analytics-skill-filter" className="sr-only">
                  Filter feedback by skill
                </label>
                <select
                  id="analytics-skill-filter"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[#0d0f0b] border border-[#5d6a4f] text-xs font-medium text-[#f2f0e8] hover:border-[#8fa654] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] cursor-pointer"
                >
                  <option value="all">All skills</option>
                  {uniqueSkills.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-[#f2f0e8]">
            No reviews received yet
          </p>
          <p className="text-xs text-[#a8ab9e] mt-1">
            Student feedback will appear here after completed mentoring sessions.
          </p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-medium text-[#f2f0e8]">
            No feedback matches the selected filters
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onClearStarFilter();
                setSkillFilter("all");
              }}
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-[#1b2116] border border-[#5d6a4f] hover:border-[#8fa654] text-xs font-medium text-[#f2f0e8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#1e2419]">
          {filteredReviews.map((rev) => (
            <article key={rev.id} className="px-5 sm:px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-sm text-[#f2f0e8]">
                    {rev.mentee.name}
                  </span>
                  <span className="text-xs font-medium text-[#b7cc7e]">
                    {rev.skill.name}
                  </span>
                  {rev.createdAt && (
                    <span className="text-xs text-[#8a8f80]">
                      {formatDate(rev.createdAt)}
                    </span>
                  )}
                  {rev.confidenceBefore !== null &&
                    rev.confidenceAfter !== null && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#c7cabf] tabular-nums">
                        Confidence {rev.confidenceBefore}
                        <ArrowRight
                          className="w-3 h-3 text-[#9eb660]"
                          aria-hidden="true"
                        />
                        {rev.confidenceAfter}
                      </span>
                    )}
                </div>

                <div
                  className="flex items-center gap-0.5 shrink-0"
                  aria-label={`${rev.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[#5d6a4f]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-2 text-sm text-[#c7cabf] leading-relaxed max-w-4xl">
                {rev.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
