import React from 'react'

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
    if (feedbacks.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No feedback yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
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
