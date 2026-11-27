"use client";

import React from "react";
import { Star } from "lucide-react";
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Feedback = {
  id: string;
  rating: number;
  comment: string;
  createdAt?: Date | string;
  skill: {
    id: string;
    name: string;
  };
  mentee: {
    id: string;
    name: string;
  };
};

type ProfileFeedbackProps = {
  feedbacks: Feedback[];
};

export default function ProfileFeedback({ feedbacks }: ProfileFeedbackProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className={`py-4 ${DM_Sans_Font.className}`}>
        <p className="text-sm font-medium text-[#f2f0e8]">No reviews yet</p>
        <p className="text-sm text-[#8a8f80] mt-1">
          Feedback from completed mentorship sessions will appear here.
        </p>
      </div>
    );
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`w-full max-w-3xl divide-y divide-[#1e2419] ${DM_Sans_Font.className}`}
    >
      {feedbacks.map((fb) => (
        <article key={fb.id} className="py-5 first:pt-0">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 shrink-0 rounded-full bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-[#b7cc7e] text-xs font-semibold">
              {fb.mentee.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#f2f0e8] truncate">
                    {fb.mentee.name}
                  </h3>
                  <span className="text-xs text-[#9eb660]">
                    {fb.skill.name}
                  </span>
                  {fb.createdAt && (
                    <span className="text-xs text-[#787d6f]">
                      {formatDate(fb.createdAt)}
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-0.5 shrink-0"
                  aria-label={`${fb.rating} out of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 ${
                        star <= fb.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-[#2a3322]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-2 text-sm text-[#c7cabf] leading-relaxed">
                {fb.comment}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
