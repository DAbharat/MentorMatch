"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { fetchRecommendations } from "@/services/recommendation.service";
import { RecommendedMentor } from "@/types/recommendation";
import RecommendationCard from "./RecommendationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
    const [mentors, setMentors] = useState<RecommendedMentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasWantedSkills, setHasWantedSkills] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRecommendations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchRecommendations(limit);
            setMentors(res.data || []);
            setHasWantedSkills(res.hasWantedSkills ?? true);
        } catch (err: unknown) {
            console.error("Recommendations error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Recommendations could not be loaded."
            );
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        void loadRecommendations();
    }, [loadRecommendations]);

    // 1. Loading Skeleton State
    if (loading) {
        return (
            <div className={`space-y-4 ${DM_Sans_Font.className}`} role="status" aria-busy="true">
                <p className="text-sm text-[#a8ab9e]">Loading mentor matches...</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: Math.min(limit, 3) }, (_, i) => (
                        <div
                            key={i}
                            className="space-y-4 rounded-2xl border border-[#242a1e] bg-[#11140e] p-5"
                        >
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 shrink-0 rounded-lg bg-[#242a1e]" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-28 bg-[#242a1e]" />
                                    <Skeleton className="h-3 w-20 bg-[#1e2419]" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full bg-[#1e2419]" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-md bg-[#242a1e]" />
                                <Skeleton className="h-5 w-20 rounded-md bg-[#242a1e]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Error state
    if (error) {
        return (
            <div className={`rounded-2xl border border-[#61282d] bg-[#231214] p-5 sm:p-6 ${DM_Sans_Font.className}`} role="alert">
                <h3 className="font-semibold text-[#f4b8bc]">Recommendations are unavailable</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#f4b8bc]">{error}</p>
                <Button
                    type="button"
                    onClick={() => void loadRecommendations()}
                    className="mt-4 h-11 cursor-pointer rounded-xl bg-[#8fa654] px-4 font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                >
                    Try again
                </Button>
            </div>
        );
    }

    // 2. Mentee has not set wanted skills yet
    if (!hasWantedSkills) {
        return (
            <div className={`mx-auto my-6 max-w-2xl rounded-2xl border border-[#242a1e] bg-[#11140e] p-6 sm:p-8 ${DM_Sans_Font.className}`}>
                <h3 className="text-lg font-semibold text-[#f2f0e8]">
                    Add skills to your profile
                </h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#a8ab9e]">
                    Choose the skills you want to learn to see mentors with matching experience.
                </p>
                <div className="mt-5">
                    <Button asChild className="h-11 cursor-pointer rounded-xl bg-[#8fa654] px-4 font-semibold text-[#0b0d08] hover:bg-[#9eb660] active:bg-[#7f9449] focus-visible:ring-2 focus-visible:ring-[#8fa654]">
                        <Link href="/profile">
                            Add learning skills
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // 4. No mentors found matching skills
    if (mentors.length === 0) {
        return (
            <div className={`rounded-2xl border border-[#242a1e] bg-[#11140e] p-6 ${DM_Sans_Font.className}`}>
                <h3 className="text-sm font-semibold text-[#f2f0e8]">No matching mentors right now</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#a8ab9e]">
                    Try changing your learning skills or search for a different skill.
                </p>
                <Button asChild className="mt-4 h-11 cursor-pointer rounded-xl bg-[#1b2116] px-4 text-[#c7cabf] hover:bg-[#242a1e] active:bg-[#2a3322] focus-visible:ring-2 focus-visible:ring-[#8fa654]">
                    <Link href="/profile">Edit learning skills</Link>
                </Button>
            </div>
        );
    }

    // 5. Success state: Grid of Recommended Mentors
    return (
        <section className={`space-y-4 ${DM_Sans_Font.className}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#f2f0e8]">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-[#a8ab9e]">
                        {subtitle}
                    </p>
                </div>

                <span className="text-xs text-[#a8ab9e] sm:pb-0.5">
                    {mentors.length} {mentors.length === 1 ? "match" : "matches"} found
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mentors.map((mentor) => (
                    <RecommendationCard key={mentor.id} mentor={mentor} />
                ))}
            </div>
        </section>
    );
}

