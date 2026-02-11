"use client";

import { useState } from "react";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileSkills from "@/components/profile/ProfileSkills";
import ProfileFeedback from "@/components/profile/ProfileFeedback";

type ProfileTabsProps = {
    stats: {
        sessionsCompleted: number;
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
        fromUser: {
            id: string;
            name: string;
        };
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
        <section className="mt-10">
            {/* TAB BAR */}
            <div className="border-b flex justify-center gap-8 text-sm font-medium">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 transition-colors ${activeTab === tab
                                ? "border-b-2 border-black text-black"
                                : "text-muted-foreground hover:text-black"
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
                    <ProfileFeedback feedbacks={feedbacks} />
                )}
            </div>
        </section>
    );
}
