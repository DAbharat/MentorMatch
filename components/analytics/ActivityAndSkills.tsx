"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Star } from "lucide-react";
import { MonthlyTrend, SkillBreakdown } from "@/types/analytics";

interface ActivityAndSkillsProps {
  mode?: "both" | "chart-only" | "table-only";
  monthlyTrends: MonthlyTrend[];
  skillsBreakdown: SkillBreakdown[];
}

type TrendMetric = "sessions" | "minutes";
type SkillSortKey = "completedSessions" | "totalMinutes" | "averageRating";

function MonthlyTrendChart({ monthlyTrends }: { monthlyTrends: MonthlyTrend[] }) {
  const [metric, setMetric] = useState<TrendMetric>("sessions");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const values = monthlyTrends.map((t) =>
    metric === "sessions" ? t.sessions : t.minutes
  );
  const totalValue = values.reduce((sum, v) => sum + v, 0);
  const rawMax = Math.max(...values, 0);
  const yMax = rawMax === 0 ? 4 : Math.ceil(rawMax / 4) * 4;
  const yTicks = [yMax, Math.round(yMax * 0.5), 0];

  const chartHeight = 180;
  const chartTop = 14;
  const chartBottom = 160;
  const plotHeight = chartBottom - chartTop;
  const plotLeft = 36;
  const plotWidth = 540;
  const colWidth = monthlyTrends.length > 0 ? plotWidth / monthlyTrends.length : plotWidth;

  const focusedTrend =
    activeIndex !== null ? monthlyTrends[activeIndex] : null;

  return (
    <section
      aria-label="Monthly mentoring volume chart"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#f2f0e8]">
            {metric === "sessions"
              ? "Sessions completed per month"
              : "Active mentoring minutes per month"}
          </h2>
          <p className="text-xs text-[#a8ab9e] mt-1 tabular-nums">
            {focusedTrend
              ? `${focusedTrend.label}: ${focusedTrend.sessions} session${
                  focusedTrend.sessions === 1 ? "" : "s"
                } · ${focusedTrend.minutes} min`
              : `Last 6 months total: ${totalValue} ${
                  metric === "sessions" ? "sessions" : "min"
                }`}
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart metric"
          className="inline-flex items-center p-1 rounded-xl bg-[#090a08] border border-[#5d6a4f] self-start sm:self-auto"
        >
          {(["sessions", "minutes"] as const).map((option) => {
            const active = metric === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setMetric(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] ${
                  active
                    ? "bg-[#8fa654] text-[#0b0d08] font-semibold"
                    : "text-[#c7cabf] hover:text-[#f2f0e8]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {totalValue === 0 ? (
        <div className="flex-1 min-h-52 flex flex-col items-center justify-center text-center border border-dashed border-[#5d6a4f] rounded-xl p-6">
          <p className="text-sm font-medium text-[#f2f0e8]">
            No completed sessions in the last 6 months
          </p>
          <p className="text-xs text-[#a8ab9e] mt-1">
            Monthly session counts and active minutes appear once calls complete.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <svg
            viewBox={`0 0 ${plotLeft + plotWidth + 12} ${chartHeight + 24}`}
            className="w-full h-56 overflow-visible"
            role="img"
            aria-label={`Bar chart showing monthly ${metric} over the last ${monthlyTrends.length} months`}
          >
            {/* Horizontal gridlines & Y-axis labels */}
            {yTicks.map((tick) => {
              const y =
                chartBottom - (tick / yMax) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={plotLeft}
                    x2={plotLeft + plotWidth}
                    y1={y}
                    y2={y}
                    stroke="#242a1e"
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                  />
                  <text
                    x={plotLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[#a8ab9e] text-[11px] tabular-nums"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Trend polyline */}
            {monthlyTrends.length > 1 && (
              <polyline
                fill="none"
                stroke="#b7cc7e"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={monthlyTrends
                  .map((t, idx) => {
                    const val = metric === "sessions" ? t.sessions : t.minutes;
                    const cx = plotLeft + idx * colWidth + colWidth / 2;
                    const cy = chartBottom - (val / yMax) * plotHeight;
                    return `${cx},${cy}`;
                  })
                  .join(" ")}
              />
            )}

            {/* Columns + interactive focus targets */}
            {monthlyTrends.map((trend, idx) => {
              const val = metric === "sessions" ? trend.sessions : trend.minutes;
              const barH = val > 0 ? Math.max((val / yMax) * plotHeight, 4) : 2;
              const barW = Math.min(colWidth * 0.44, 40);
              const cx = plotLeft + idx * colWidth + colWidth / 2;
              const x = cx - barW / 2;
              const y = chartBottom - barH;
              const isHighlighted =
                activeIndex === idx ||
                (activeIndex === null && idx === monthlyTrends.length - 1);

              return (
                <g
                  key={trend.label}
                  tabIndex={0}
                  role="button"
                  aria-pressed={activeIndex === idx}
                  aria-label={`${trend.label}: ${trend.sessions} sessions, ${trend.minutes} minutes`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(idx)}
                  onBlur={() => setActiveIndex(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex((prev) => (prev === idx ? null : idx));
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Full-column hover/focus hit area */}
                  <rect
                    x={plotLeft + idx * colWidth + 4}
                    y={chartTop}
                    width={Math.max(colWidth - 8, 12)}
                    height={plotHeight}
                    rx={8}
                    fill={activeIndex === idx ? "rgba(143,166,84,0.10)" : "transparent"}
                    stroke={activeIndex === idx ? "#8fa654" : "transparent"}
                    strokeWidth="1.5"
                  />

                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={6}
                    fill={val === 0 ? "#566348" : isHighlighted ? "#8fa654" : "#5d6a4f"}
                    className="transition-colors duration-200 motion-reduce:transition-none"
                  />

                  {/* Point marker on trend line */}
                  <circle
                    cx={cx}
                    cy={chartBottom - (val / yMax) * plotHeight}
                    r={activeIndex === idx ? 4.5 : 3}
                    fill={isHighlighted ? "#b7cc7e" : "#8fa654"}
                    stroke="#11140e"
                    strokeWidth="1.5"
                  />

                  {/* Value above bar when hovered/focused */}
                  {activeIndex === idx && (
                    <text
                      x={cx}
                      y={Math.max(y - 8, 12)}
                      textAnchor="middle"
                      className="fill-[#f2f0e8] text-[11px] font-semibold tabular-nums"
                    >
                      {val}
                    </text>
                  )}

                  {/* Month label */}
                  <text
                    x={cx}
                    y={chartBottom + 18}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      activeIndex === idx ? "fill-[#f2f0e8] font-semibold" : "fill-[#a8ab9e]"
                    }`}
                  >
                    {trend.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}

function SkillsBreakdownTable({
  skillsBreakdown,
}: {
  skillsBreakdown: SkillBreakdown[];
}) {
  const [sortKey, setSortKey] = useState<SkillSortKey>("completedSessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedSkills = useMemo(() => {
    return [...skillsBreakdown].sort((a, b) => {
      const aVal = a[sortKey] ?? -1;
      const bVal = b[sortKey] ?? -1;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [skillsBreakdown, sortKey, sortDir]);

  const totalSessions = skillsBreakdown.reduce(
    (sum, s) => sum + s.completedSessions,
    0
  );

  const toggleSort = (key: SkillSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const renderSortIcon = (key: SkillSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8f80]" aria-hidden="true" />;
    }
    return sortDir === "desc" ? (
      <ArrowDown className="w-3.5 h-3.5 text-[#b7cc7e]" aria-hidden="true" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-[#b7cc7e]" aria-hidden="true" />
    );
  };

  return (
    <section
      aria-label="Skills performance breakdown"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl overflow-hidden"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-[#242a1e] flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[#f2f0e8]">
            Skills performance
          </h2>
          <p className="text-xs text-[#a8ab9e] mt-0.5">
            Completed sessions, active mentoring time, and average rating per skill
          </p>
        </div>
        <span className="text-xs text-[#a8ab9e] tabular-nums">
          {skillsBreakdown.length} skill{skillsBreakdown.length === 1 ? "" : "s"}
        </span>
      </div>

      {skillsBreakdown.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-[#f2f0e8]">
            No skill sessions recorded yet
          </p>
          <p className="text-xs text-[#a8ab9e] mt-1">
            Completed sessions tagged with a skill will populate this breakdown.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#242a1e] text-xs text-[#a8ab9e]">
                <th scope="col" className="py-3 pl-5 sm:pl-6 pr-3 font-medium">
                  Skill
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === "completedSessions"
                      ? sortDir === "desc"
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                  className="py-3 px-3 font-medium"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("completedSessions")}
                    className="inline-flex items-center gap-1.5 hover:text-[#f2f0e8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] rounded px-1 -ml-1 py-0.5"
                  >
                    Sessions
                    {renderSortIcon("completedSessions")}
                  </button>
                </th>
                <th scope="col" className="py-3 px-3 font-medium hidden sm:table-cell">
                  Share
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === "totalMinutes"
                      ? sortDir === "desc"
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                  className="py-3 px-3 font-medium"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("totalMinutes")}
                    className="inline-flex items-center gap-1.5 hover:text-[#f2f0e8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] rounded px-1 -ml-1 py-0.5"
                  >
                    Active time
                    {renderSortIcon("totalMinutes")}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === "averageRating"
                      ? sortDir === "desc"
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                  className="py-3 pl-3 pr-5 sm:pr-6 font-medium text-right"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("averageRating")}
                    className="inline-flex items-center gap-1.5 hover:text-[#f2f0e8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] rounded px-1 py-0.5"
                  >
                    Avg rating
                    {renderSortIcon("averageRating")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2419] text-sm">
              {sortedSkills.map((skill) => {
                const share =
                  totalSessions > 0
                    ? Math.round((skill.completedSessions / totalSessions) * 100)
                    : 0;
                const hours = Math.floor(skill.totalMinutes / 60);
                const mins = skill.totalMinutes % 60;
                const formattedTime =
                  hours > 0 ? `${hours}h ${mins}m` : `${skill.totalMinutes}m`;

                return (
                  <tr
                    key={skill.skillId}
                    className="hover:bg-[#161b12] transition-colors motion-reduce:transition-none"
                  >
                    <td className="py-3.5 pl-5 sm:pl-6 pr-3 font-medium text-[#f2f0e8]">
                      {skill.skillName}
                    </td>
                    <td className="py-3.5 px-3 text-[#c7cabf] tabular-nums">
                      {skill.completedSessions}
                    </td>
                    <td className="py-3.5 px-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2.5 max-w-[160px]">
                        <div className="flex-1 h-2 rounded-full bg-[#1b2116] border border-[#2d3622] overflow-hidden">
                          <div
                            className="h-full bg-[#8fa654] rounded-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#a8ab9e] tabular-nums w-8">
                          {share}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#c7cabf] tabular-nums">
                      {formattedTime}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 sm:pr-6 text-right tabular-nums">
                      {skill.averageRating !== null ? (
                        <span className="inline-flex items-center justify-end gap-1.5 text-[#f2f0e8]">
                          <Star
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                          {skill.averageRating.toFixed(1)}
                          <span className="text-xs text-[#8a8f80]">
                            ({skill.feedbackCount})
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#8a8f80]">No ratings</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ActivityAndSkills({
  mode = "both",
  monthlyTrends,
  skillsBreakdown,
}: ActivityAndSkillsProps) {
  if (mode === "chart-only") {
    return <MonthlyTrendChart monthlyTrends={monthlyTrends} />;
  }
  if (mode === "table-only") {
    return <SkillsBreakdownTable skillsBreakdown={skillsBreakdown} />;
  }
  return (
    <div className="space-y-5">
      <MonthlyTrendChart monthlyTrends={monthlyTrends} />
      <SkillsBreakdownTable skillsBreakdown={skillsBreakdown} />
    </div>
  );
}
