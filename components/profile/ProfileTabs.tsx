"use client";

import { useRef, useState, type KeyboardEvent } from "react";
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(TABS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 ${DM_Sans_Font.className}`}
    >
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex items-center gap-2 border-b border-[#242a1e]"
      >
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          const count =
            tab === "Feedback" && feedbacks.length > 0
              ? feedbacks.length
              : null;
          const tabId = `profile-tab-${tab.toLowerCase()}`;

          return (
            <button
              key={tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-controls={`profile-panel-${tab.toLowerCase()}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`relative flex min-h-11 items-center gap-1.5 rounded-none border-b-2 px-3 text-sm transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa654]/50 ${
                isActive
                  ? "border-[#8fa654] font-semibold text-[#f2f0e8]"
                  : "border-transparent font-medium text-[#9a9e91] hover:text-[#f2f0e8]"
              }`}
            >
              <span>{tab}</span>
              {count !== null && (
                <span
                  className={`text-xs tabular-nums ${
                    isActive ? "text-[#b7cc7e]" : "text-[#9a9e91]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`profile-panel-${activeTab.toLowerCase()}`}
        aria-labelledby={`profile-tab-${activeTab.toLowerCase()}`}
        tabIndex={0}
        className="mt-7 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
      >
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
