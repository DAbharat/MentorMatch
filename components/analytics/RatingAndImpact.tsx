"use client";

import React from "react";
import { Star } from "lucide-react";
import { RatingDistribution } from "@/types/analytics";

interface RatingAndImpactProps {
  averageRating: number | null;
  totalReviews: number;
  distribution: RatingDistribution;
  averageConfidenceGain: number | null;
  selectedStarFilter: number | null;
  onSelectStarFilter: (stars: number | null) => void;
}

export default function RatingAndImpact({
  averageRating,
  totalReviews,
  distribution,
  averageConfidenceGain,
  selectedStarFilter,
  onSelectStarFilter,
}: RatingAndImpactProps) {
  const starLevels = [5, 4, 3, 2, 1];
  const hasConfidenceData =
    averageConfidenceGain !== null && !Number.isNaN(averageConfidenceGain);

  return (
    <section
      aria-label="Confidence impact and rating breakdown"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between gap-6"
    >
      {/* Confidence Gain */}
      <div className="pb-5 border-b border-[#242a1e]">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-[#f2f0e8]">
            Mentee confidence delta
          </h2>
          <span className="text-xs text-[#8a8f80]">5-point scale</span>
        </div>

        <div className="mt-3">
          {hasConfidenceData ? (
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-bold text-[#b7cc7e] tracking-tight tabular-nums">
                {averageConfidenceGain > 0
                  ? `+${averageConfidenceGain.toFixed(1)}`
                  : averageConfidenceGain.toFixed(1)}
              </span>
              <span className="text-xs text-[#a8ab9e]">
                avg post-session lift
              </span>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-[#8a8f80] tabular-nums">
                --
              </p>
              <p className="text-xs text-[#8a8f80] mt-1">
                Collected from pre/post session confidence ratings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Rating Distribution */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-baseline justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#f2f0e8]">
              Rating distribution
            </h3>
            <p className="text-xs text-[#8a8f80] mt-0.5">
              {totalReviews > 0
                ? "Click a tier to filter feedback below"
                : "No reviews submitted yet"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-lg font-bold text-[#f2f0e8] tabular-nums">
              {averageRating !== null ? averageRating.toFixed(1) : "--"}
            </span>
            <Star
              className="w-4 h-4 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          {starLevels.map((stars) => {
            const count = distribution[stars] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isSelected = selectedStarFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Filter feedback by ${stars} star${
                  stars === 1 ? "" : "s"
                } (${count} review${count === 1 ? "" : "s"})`}
                disabled={count === 0 && !isSelected}
                onClick={() =>
                  onSelectStarFilter(isSelected ? null : stars)
                }
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl border text-xs transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] ${
                  isSelected
                    ? "bg-[#1b2116] border-[#8fa654] text-[#f2f0e8] cursor-pointer"
                    : count > 0
                    ? "bg-transparent border-transparent hover:bg-[#161b12] hover:border-[#5d6a4f] text-[#c7cabf] cursor-pointer"
                    : "bg-transparent border-transparent text-[#8a8f80] opacity-60 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-1 w-8 shrink-0 font-medium tabular-nums">
                  <span>{stars}</span>
                  <Star
                    className="w-3 h-3 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                </span>
                <span className="flex-1 h-2 rounded-full bg-[#1b2116] border border-[#2d3622] overflow-hidden">
                  <span
                    className="block h-full bg-amber-400 rounded-full transition-all duration-300 motion-reduce:transition-none"
                    style={{ width: `${percentage}%` }}
                  />
                </span>
                <span className="w-7 text-right text-[#c7cabf] tabular-nums shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
