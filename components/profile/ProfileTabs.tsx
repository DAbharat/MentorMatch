"use client";

import { useState } from "react";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileSkills from "@/components/profile/ProfileSkills";
import ProfileFeedback from "@/components/profile/ProfileFeedback";
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
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
};

const TABS = ["Skills", "Stats", "Feedback"] as const;
type Tab = (typeof TABS)[number];

export default function ProfileTabs({
    stats,
    skillsOffered,
    skillsWanted,
    feedbacks,
}: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<Tab>("Skills");

    return (
        <section className={`mt-4 md:mt-14 lg:mt-14 bg-[#0b090a] ${DM_Sans_Font.className}`}>
            {/* TAB BAR */}
            <div className="border-b border-[#1f1f1f] flex justify-center gap-8 text-md font-medium bg-[#0b090a]">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`cursor-pointer pb-3 transition-colors ${activeTab === tab
                                ? "border-b-2 border-[#d3d3d3] text-[#d3d3d3]"
                                : "text-muted-foreground hover:text-[#d3d3d3]"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="mt-8">
                {activeTab === "Skills" && (
                    <ProfileSkills
                        skillsOffered={skillsOffered}
                        skillsWanted={skillsWanted}
                    />
                )}

                {activeTab === "Stats" && <ProfileStats stats={stats} />}

                {activeTab === "Feedback" && (
                    <ProfileFeedback 
                     feedbacks={feedbacks}
                     />
                )}
            </div>
        </section>
    );
}
