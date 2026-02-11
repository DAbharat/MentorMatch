import React from 'react'


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
  return (
    <div className="grid grid-cols-3 gap-6 text-center">
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
