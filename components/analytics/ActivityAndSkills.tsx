import React from "react";
import { SkillBreakdown, MonthlyTrend } from "@/types/analytics";
import { Badge } from "@/components/ui/badge";
import { Star, BarChart3, BookOpen } from "lucide-react";

interface ActivityAndSkillsProps {
    monthlyTrends: MonthlyTrend[];
    skillsBreakdown: SkillBreakdown[];
}

export default function ActivityAndSkills({
    monthlyTrends,
    skillsBreakdown,
}: ActivityAndSkillsProps) {
    const maxSessions = Math.max(...monthlyTrends.map((t) => t.sessions), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 6-Month Monthly Trend */}
            <div className="p-6 rounded-xl bg-[#111315] border border-[#1f1f1f] flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Monthly Activity</h3>
                        </div>
                        <span className="text-xs text-neutral-400">Last 6 Months</span>
                    </div>

                    <div className="grid grid-cols-6 gap-2 items-end h-40 pt-6 pb-2">
                        {monthlyTrends.map((trend, idx) => {
                            const barHeight = trend.sessions > 0 ? (trend.sessions / maxSessions) * 100 : 4;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                                    <span className="text-[10px] text-neutral-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        {trend.sessions}
                                    </span>
                                    <div
                                        className="w-full max-w-[36px] bg-blue-500/40 border border-blue-500/60 rounded-t-md hover:bg-blue-500 transition-all duration-200"
                                        style={{ height: `${barHeight}%` }}
                                    />
                                    <span className="text-[10px] text-neutral-400 font-medium truncate w-full text-center">
                                        {trend.label.split(" ")[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="text-xs text-neutral-500 mt-3 text-center">
                    Completed session volume over time
                </p>
            </div>

            {/* Skills Mentored Breakdown */}
            <div className="p-6 rounded-xl bg-[#111315] border border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Top Mentored Skills</h3>
                </div>

                {skillsBreakdown.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-8 text-center">
                        No skill sessions completed yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {skillsBreakdown.slice(0, 5).map((skill) => (
                            <div
                                key={skill.skillId}
                                className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Badge variant="outline" className="border-neutral-700 bg-neutral-800 text-neutral-200">
                                        {skill.skillName}
                                    </Badge>
                                    <span className="text-xs text-neutral-400">
                                        {skill.completedSessions} {skill.completedSessions === 1 ? "session" : "sessions"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-neutral-400">
                                        {Math.round(skill.totalMinutes / 60)} hrs
                                    </span>
                                    <div className="flex items-center gap-1 font-medium text-amber-400">
                                        {skill.averageRating ? skill.averageRating.toFixed(1) : "--"}
                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

