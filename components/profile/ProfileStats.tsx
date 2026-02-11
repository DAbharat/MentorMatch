import React from 'react'
import { DM_Sans } from 'next/font/google';

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type ProfileStatsProps = {
    stats: {
        sessionsCompleted: number;
        averageRating: number | null;
        ratingCount: number;
    }
}
export default function ProfileStats(
    { stats }: ProfileStatsProps
) {

  if (!stats) {
    return (
      <div className={`p-6 rounded-xl text-center ${DM_Sans_Font.className}`}>
        <p className="text-sm text-muted-foreground">
          No stats available for this user!
        </p>
      </div>
    );
  }
  const hasStats = stats.sessionsCompleted > 0 || stats.ratingCount > 0

  if(!hasStats) {
    return (
      <div className={`p-6 rounded-xl text-center ${DM_Sans_Font.className}`}>
        <p className="text-sm text-muted-foreground">
          No activity yet
        </p>
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-3 gap-6 text-center ${DM_Sans_Font.className}`}>
      <div className="p-4 rounded-xl bg-slate-50">
        <p className="text-2xl font-semibold">{stats.sessionsCompleted}</p>
        <p className="text-sm text-muted-foreground">Sessions</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50">
        <p className="text-2xl font-semibold">{stats.averageRating !== null ? stats.averageRating.toFixed(1) : "N/A"}</p>
        <p className="text-sm text-muted-foreground">Rating</p>
      </div>
    </div>
  )
}
