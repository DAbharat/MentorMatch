"use client"

import React from 'react'
import { DM_Sans } from 'next/font/google'
import { Star, CalendarCheck, MessageSquare } from 'lucide-react'

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type ProfileStatsProps = {
  stats: {
    sessionsCompletedAsMentor: number
    sessionsCompletedAsMentee: number
    averageRating: number | null
    ratingCount: number
  }
}

function StatCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-3 px-6 py-5 rounded-lg bg-[#111315] border border-[#1f1f1f] hover:border-[#2a2f34] hover:scale-[1.02] transition-all duration-200 h-full">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) {
    return (
      <div className={`px-6 py-8 rounded-lg text-center ${DM_Sans_Font.className}`}>
        <p className="text-sm text-muted-foreground">
          No stats available for this user
        </p>
      </div>
    )
  }

  const hasStats =
    stats.sessionsCompletedAsMentor > 0 ||
    stats.sessionsCompletedAsMentee > 0 ||
    stats.ratingCount > 0

  if (!hasStats) {
    return (
      <div className={`px-6 py-8 rounded-lg text-center ${DM_Sans_Font.className}`}>
        <p className="text-sm text-muted-foreground">
          No activity yet
        </p>
      </div>
    )
  }

  const totalSessions =
    stats.sessionsCompletedAsMentor + stats.sessionsCompletedAsMentee

  const rating = stats.averageRating ?? 0
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div
      className={`
        w-full max-w-5xl mx-auto
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-5 px-4
        ${DM_Sans_Font.className}
      `}
    >

      {/* Sessions */}
      <StatCard icon={<CalendarCheck size={16} />} label="Sessions">
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold text-[#d3d3d3]">
              {totalSessions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Sessions
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#1f1f1f]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                As Mentor
              </span>
              <span className="text-sm font-semibold text-[#d3d3d3]">
                {stats.sessionsCompletedAsMentor}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                As Mentee
              </span>
              <span className="text-sm font-semibold text-[#d3d3d3]">
                {stats.sessionsCompletedAsMentee}
              </span>
            </div>
          </div>
        </div>
      </StatCard>

      {/* Total Ratings */}
      <StatCard icon={<MessageSquare size={16} />} label="Total Ratings">
        <div>
          <p className="text-3xl font-bold text-[#d3d3d3]">
            {stats.ratingCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ratings Received
          </p>
        </div>
      </StatCard>

      {/* Average Rating */}
      <StatCard icon={<Star size={16} />} label="Avg Rating">
        {stats.averageRating !== null ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-[#d3d3d3]">
                {stats.averageRating.toFixed(1)}
              </p>
              <span className="text-xs text-muted-foreground">/ 5.0</span>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < fullStars
                      ? "text-[#d3d3d3] fill-[#d3d3d3]"
                      : i === fullStars && hasHalf
                      ? "text-[#d3d3d3] fill-[#d3d3d3] opacity-50"
                      : "text-[#2a2f34]"
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-medium">
            No ratings yet
          </p>
        )}
      </StatCard>

    </div>
  )
}