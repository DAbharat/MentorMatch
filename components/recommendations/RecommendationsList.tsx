"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { Sparkles, Compass, ArrowRight, UserCheck } from "lucide-react";
import { fetchRecommendations } from "@/services/recommendation.service";
import { RecommendedMentor } from "@/types/recommendation";
import RecommendationCard from "./RecommendationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/retroui/Button";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

interface RecommendationsListProps {
    limit?: number;
    title?: string;
    subtitle?: string;
}

export default function RecommendationsList({
    limit = 6,
    title = "Recommended For You",
    subtitle = "Mentors matched to your learning goals and desired skills",
}: RecommendationsListProps) {
    const router = useRouter();

    const [mentors, setMentors] = useState<RecommendedMentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasWantedSkills, setHasWantedSkills] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRecommendations();
    }, [limit]);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchRecommendations(limit);
            setMentors(res.data || []);
            setHasWantedSkills(res.hasWantedSkills ?? true);
        } catch (err: any) {
            console.error("Recommendations error:", err);
            setError(err.message || "Failed to load recommendations");
        } finally {
            setLoading(false);
        }
    };

    // 1. Loading Skeleton State
    if (loading) {
        return (
            <div className={`space-y-4 ${DM_Sans_Font.className}`}>
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <Skeleton className="h-6 w-48 bg-neutral-800" />
                        <Skeleton className="h-4 w-72 bg-neutral-800/60 mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-xl bg-[#111315] border border-[#1f1f1f] space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full bg-neutral-800 shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-28 bg-neutral-800" />
                                    <Skeleton className="h-3 w-20 bg-neutral-800/60" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full bg-neutral-800/50" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 bg-neutral-800/60 rounded-md" />
                                <Skeleton className="h-5 w-20 bg-neutral-800/60 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. Mentee has not set wanted skills yet
    if (!hasWantedSkills) {
        return (
            <div className={`p-6 sm:p-8 rounded-xl bg-[#111315] border border-[#1f1f1f] text-center max-w-2xl mx-auto my-6 ${DM_Sans_Font.className}`}>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                    <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    Unlock Personalized Recommendations
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-md mx-auto">
                    Add the skills you want to learn to your profile so our matching engine can recommend the top-rated mentors for your growth.
                </p>
                <div className="mt-5">
                    <Button
                        onClick={() => router.push("/profile")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        Add Wanted Skills <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // 3. Error state
    if (error) {
        return null; // Silently degrade or show nothing if unauthenticated / offline
    }

    // 4. No mentors found matching skills
    if (mentors.length === 0) {
        return (
            <div className={`p-6 rounded-xl bg-[#111315] border border-[#1f1f1f] text-center ${DM_Sans_Font.className}`}>
                <UserCheck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <h4 className="text-white font-medium text-sm">No matching mentors right now</h4>
                <p className="text-xs text-neutral-500 mt-1">
                    Try searching for specific skills above or updating your learning preferences in your profile.
                </p>
            </div>
        );
    }

    // 5. Success state: Grid of Recommended Mentors
    return (
        <section className={`space-y-4 ${DM_Sans_Font.className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            {title}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <span className="text-xs text-neutral-500">
                    {mentors.length} {mentors.length === 1 ? "match" : "matches"} found
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                    <RecommendationCard key={mentor.id} mentor={mentor} />
                ))}
            </div>
        </section>
    );
}

