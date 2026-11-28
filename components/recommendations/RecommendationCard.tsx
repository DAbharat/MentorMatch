"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { Star, Video, TrendingUp } from "lucide-react";
import { RecommendedMentor } from "@/types/recommendation";
import { Badge } from "@/components/ui/badge";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

interface RecommendationCardProps {
    mentor: RecommendedMentor;
}

export default function RecommendationCard({ mentor }: RecommendationCardProps) {
    const matchedSkillIds = new Set(mentor.matchedSkills?.map((s) => s.id) || []);
    const otherSkills = (mentor.skillsOffered || []).filter((s) => !matchedSkillIds.has(s.id));

    return (
        <Link
            href={`/profile/${mentor.id}`}
            aria-label={`View ${mentor.name}'s profile`}
            className={`group flex min-w-0 flex-col justify-between gap-5 rounded-2xl border border-[#242a1e] bg-[#11140e] p-5 transition-colors hover:border-[#4d5c33] hover:bg-[#141811] active:bg-[#1b2116] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] ${DM_Sans_Font.className}`}
        >
            <div>
                {/* Header: Avatar, Name & Match Score Badge */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg border border-[#3a4530] bg-[#161b12] flex items-center justify-center text-[#b7cc7e] font-semibold text-lg shrink-0">
                            {mentor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-[#f2f0e8] group-hover:text-[#cde099] transition-colors truncate">
                                {mentor.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-[#a8ab9e]">
                                <span className="flex items-center gap-1 font-medium text-[#f59e0b]">
                                    <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                                    {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{mentor.ratingCount} {mentor.ratingCount === 1 ? "review" : "reviews"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="shrink-0 text-right">
                        <span className="block text-sm font-semibold tabular-nums text-[#b7cc7e]">
                            {Math.round(mentor.matchScore)}%
                        </span>
                        <span className="text-[11px] text-[#a8ab9e]">match</span>
                    </div>
                </div>

                {/* Bio snippet */}
                {mentor.bio && (
                    <p className="text-xs sm:text-sm text-[#c7cabf] line-clamp-2 mt-3 leading-relaxed">
                        {mentor.bio}
                    </p>
                )}

                {/* Matched & Offered Skills */}
                <div className="mt-4 space-y-2">
                    {/* Skills directly matching mentee's wanted skills */}
                    {mentor.matchedSkills && mentor.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-medium text-[#b7cc7e] mr-1">
                                Matching:
                            </span>
                            {mentor.matchedSkills.map((skill) => (
                                <Badge
                                    key={skill.id}
                                    variant="outline"
                                    className="rounded-md border-[#3a4530] bg-[#161b12] text-[#c7cabf] text-[11px] px-2 py-0.5"
                                >
                                    {skill.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Other skills offered */}
                    {otherSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {otherSkills.slice(0, 3).map((skill) => (
                                <Badge
                                    key={skill.id}
                                    variant="outline"
                                    className="rounded-md border-[#283022] bg-[#0d0f0b] text-[#a8ab9e] text-[11px] px-2 py-0.5"
                                >
                                    {skill.name}
                                </Badge>
                            ))}
                            {otherSkills.length > 3 && (
                                <span className="text-[11px] text-[#a8ab9e]">
                                    +{otherSkills.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Metrics + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#1e2419] pt-3.5 text-xs text-[#a8ab9e]">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#a8ab9e]" aria-hidden="true" />
                        {mentor.completedSessionsCount} sessions
                    </span>

                    {mentor.confidenceGainAvg !== undefined && mentor.confidenceGainAvg > 0 && (
                        <span className="flex items-center gap-1.5 text-[#6ee7b7] font-medium">
                            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                            +{mentor.confidenceGainAvg.toFixed(1)} confidence
                        </span>
                    )}
                </div>

                <span className="font-medium text-[#b7cc7e] group-hover:text-[#cde099] transition-colors text-xs">
                    View profile
                </span>
            </div>
        </Link>
    );
}

