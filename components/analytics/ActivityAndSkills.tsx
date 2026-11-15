import React from "react";
import { SkillBreakdown, MonthlyTrend } from "@/types/analytics";
import { BarChart3, BookOpen } from "lucide-react";

interface ActivityAndSkillsProps {
    monthlyTrends: MonthlyTrend[];
    skillsBreakdown: SkillBreakdown[];
}

export default function ActivityAndSkills({
    monthlyTrends,
    skillsBreakdown,
}: ActivityAndSkillsProps) {
    const totalSessionsInPeriod = monthlyTrends.reduce((acc, curr) => acc + curr.sessions, 0);
    const maxSessions = Math.max(...monthlyTrends.map((t) => t.sessions), 1);
    const maxSkillSessions = Math.max(...skillsBreakdown.map((s) => s.completedSessions), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Monthly Activity */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#111214] border border-[#25272A] h-full">
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#00D6A0]" />
                            <h3 className="text-base font-semibold text-[#F5F5F5]">Monthly Activity</h3>
                        </div>
                        <span className="text-xs font-medium text-[#9299A3] px-2.5 py-1 rounded-md bg-[#17191C] border border-[#25272A]">
                            Last 6 Months
                        </span>
                    </div>

                    {totalSessionsInPeriod === 0 ? (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                            <BarChart3 className="w-8 h-8 text-[#9299A3] opacity-40 mb-2" />
                            <p className="text-xs text-[#9299A3]">
                                No completed sessions in the last 6 months.
                            </p>
                        </div>
                    ) : (
                        <div className="pt-2">
                            <div className="grid grid-cols-6 gap-3 items-end h-40 pb-2 border-b border-[#25272A]">
                                {monthlyTrends.map((trend, idx) => {
                                    const isMostRecent = idx === monthlyTrends.length - 1;
                                    const barHeight = trend.sessions > 0 ? (trend.sessions / maxSessions) * 100 : 6;
                                    const barColor = isMostRecent ? "#00D6A0" : "#164B3D";

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                                            <span className="text-[11px] text-[#9299A3] font-medium tabular-nums">
                                                {trend.sessions}
                                            </span>
                                            <div
                                                className="w-full max-w-[32px] rounded-t-md transition-all duration-300"
                                                style={{
                                                    height: `${barHeight}%`,
                                                    backgroundColor: barColor,
                                                }}
                                            />
                                            <span className="text-[11px] text-[#9299A3] font-medium truncate w-full text-center">
                                                {trend.label.split(" ")[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-[#9299A3] mt-3 text-center">
                                Number of completed mentoring sessions per month.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Card: Top Mentored Skills */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#111214] border border-[#25272A] h-full">
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <BookOpen className="w-4 h-4 text-[#B78AFF]" />
                        <h3 className="text-base font-semibold text-[#F5F5F5]">Top Mentored Skills</h3>
                    </div>

                    {skillsBreakdown.length === 0 ? (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                            <BookOpen className="w-8 h-8 text-[#9299A3] opacity-40 mb-2" />
                            <p className="text-xs text-[#9299A3]">
                                No completed sessions yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {skillsBreakdown.slice(0, 5).map((skill) => {
                                const percentage = (skill.completedSessions / maxSkillSessions) * 100;

                                return (
                                    <div key={skill.skillId} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-[#F5F5F5]">
                                                {skill.skillName}
                                            </span>
                                            <span className="text-[#9299A3] tabular-nums">
                                                {skill.completedSessions} {skill.completedSessions === 1 ? "session" : "sessions"}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[#292B2E] overflow-hidden">
                                            <div
                                                className="h-full bg-[#B78AFF] rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
