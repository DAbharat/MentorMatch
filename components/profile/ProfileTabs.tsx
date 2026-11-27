"use client";

import { useState } from "react";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileSkills from "@/components/profile/ProfileSkills";
import ProfileFeedback from "@/components/profile/ProfileFeedback";
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type ProfileTabsProps = {
  stats: {
    sessionsCompletedAsMentor: number;
    sessionsCompletedAsMentee: number;
    averageRating: number | null;
    ratingCount: number;
  };
  skillsOffered: {
    id: string;
    name: string;
  }[];
  skillsWanted: {
    id: string;
    name: string;
  }[];
  feedbacks: {
    id: string;
    mentee: {
      id: string;
      name: string;
    };
    skill: {
      id: string;
      name: string;
    };
    createdAt: Date | string;
    comment: string;
    rating: number;
  }[];
  isOwner?: boolean;
};

const TABS = ["Skills", "Stats", "Feedback"] as const;
type Tab = (typeof TABS)[number];

export default function ProfileTabs({
  stats,
  skillsOffered,
  skillsWanted,
  feedbacks,
  isOwner = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Skills");

  return (
    <section
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 pb-16 ${DM_Sans_Font.className}`}
    >
      {/* Clean underline tab navigation */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex items-center gap-6 sm:gap-8 border-b border-[#1e2419]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "Feedback" && feedbacks.length > 0
              ? feedbacks.length
              : null;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`relative py-3 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 rounded-t-sm ${
                isActive
                  ? "text-[#f2f0e8]"
                  : "text-[#8a8f80] hover:text-[#c7cabf]"
              }`}
            >
              <span>{tab}</span>
              {count !== null && (
                <span className="ml-1.5 text-xs text-[#9eb660] tabular-nums">
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-[#8fa654]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content directly on canvas */}
      <div className="mt-8">
        {activeTab === "Skills" && (
          <ProfileSkills
            skillsOffered={skillsOffered}
            skillsWanted={skillsWanted}
            isOwner={isOwner}
          />
        )}

        {activeTab === "Stats" && <ProfileStats stats={stats} />}

        {activeTab === "Feedback" && <ProfileFeedback feedbacks={feedbacks} />}
      </div>
    </section>
  );
}
