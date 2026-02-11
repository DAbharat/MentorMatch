import React from 'react'
import { DM_Sans } from 'next/font/google';

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type Feedback = {
    id: string;
    rating: number;
    comment?: string;
    fromUser: {
        id: string;
        name: string;
    }
}

type ProfileFeedbackProps = {
    feedbacks: Feedback[];
}

export default function ProfileFeedback(
    { feedbacks }: ProfileFeedbackProps
) {
    if (!feedbacks) {
    return (
      <div className={`p-6 rounded-xl text-center ${DM_Sans_Font.className}`}>
        <p className="text-sm text-muted-foreground">
          No feedback available for this user!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${DM_Sans_Font.className}`}>
      {feedbacks.map((fb) => (
        <div
          key={fb.id}
          className="p-4 rounded-xl border bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium">{fb.fromUser.name}</p>
            <span className="text-sm text-muted-foreground">
              ⭐ {fb.rating}
            </span>
          </div>
          {fb.comment && <p className="text-sm text-muted-foreground">{fb.comment}</p>}
        </div>
      ))}
    </div>
  )
}
