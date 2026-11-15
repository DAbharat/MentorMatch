"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { Star, Video, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { RecommendedMentor } from "@/types/recommendation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/retroui/Button";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

interface RecommendationCardProps {
    mentor: RecommendedMentor;
}

export default function RecommendationCard({ mentor }: RecommendationCardProps) {
    const router = useRouter();

    const matchedSkillIds = new Set(mentor.matchedSkills?.map((s) => s.id) || []);
    const otherSkills = (mentor.skillsOffered || []).filter((s) => !matchedSkillIds.has(s.id));

    const handleNavigate = () => {
        router.push(`/profile/${mentor.id}`);
    };

    return (
        <div
            onClick={handleNavigate}
            className={`flex flex-col justify-between p-5 rounded-xl bg-[#111315] border border-[#1f1f1f] hover:border-[#2a2f34] hover:scale-[1.01] transition-all duration-200 cursor-pointer group ${DM_Sans_Font.className}`}
        >
            <div>
                {/* Header: Avatar, Name & Match Score Badge */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black font-bold text-lg shadow-md shrink-0">
                            {mentor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                                {mentor.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                                <span className="flex items-center gap-1 font-medium text-amber-400">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
                                </span>
                                <span>·</span>
                                <span>{mentor.ratingCount} {mentor.ratingCount === 1 ? "review" : "reviews"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{Math.round(mentor.matchScore)}% Match</span>
                    </div>
                </div>

                {/* Bio snippet */}
                {mentor.bio && (
                    <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 mt-3 leading-relaxed">
                        {mentor.bio}
                    </p>
                )}

                {/* Matched & Offered Skills */}
                <div className="mt-4 space-y-2">
                    {/* Skills directly matching mentee's wanted skills */}
                    {mentor.matchedSkills && mentor.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 mr-1">
                                Matching:
                            </span>
                            {mentor.matchedSkills.map((skill) => (
                                <Badge
                                    key={skill.id}
                                    variant="outline"
                                    className="bg-purple-500/10 border-purple-500/25 text-purple-300 text-[11px] px-2 py-0.5"
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
                                    className="bg-neutral-900 border-neutral-800 text-neutral-400 text-[11px] px-2 py-0.5"
                                >
                                    {skill.name}
                                </Badge>
                            ))}
                            {otherSkills.length > 3 && (
                                <span className="text-[11px] text-neutral-500">
                                    +{otherSkills.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Metrics + CTA */}
            <div className="mt-5 pt-3.5 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-neutral-500" />
                        {mentor.completedSessionsCount} sessions
                    </span>

                    {mentor.confidenceGainAvg !== undefined && mentor.confidenceGainAvg > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{mentor.confidenceGainAvg.toFixed(1)} boost
                        </span>
                    )}
                </div>

                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1 text-xs">
                    Connect <ArrowRight className="w-3 h-3" />
                </span>
            </div>
        </div>
    );
}

