export interface MentorAnalyticsOverview {
    totalCompletedSessions: number;
    totalActiveHours: number;
    totalActiveMinutes: number;
    uniqueMenteesCount: number;
    upcomingSessionsCount: number;
    cancelledSessionsCount: number;
    averageRating: number | null;
    totalReviewsCount: number;
    averageConfidenceGain: number | null;
}

export type RatingDistribution = Record<number, number>;

export interface MonthlyTrend {
    label: string;
    sessions: number;
    minutes: number;
}

export interface SkillBreakdown {
    skillId: string;
    skillName: string;
    completedSessions: number;
    totalMinutes: number;
    feedbackCount: number;
    averageRating: number | null;
}

export interface AnalyticsFeedback {
    id: string;
    rating: number;
    comment: string;
    confidenceBefore: number | null;
    confidenceAfter: number | null;
    createdAt: string;
    skill: {
        id: string;
        name: string;
    };
    mentee: {
        id: string;
        name: string;
    };
}

export interface MentorAnalyticsResponse {
    overview: MentorAnalyticsOverview;
    ratingDistribution: RatingDistribution;
    monthlyTrends: MonthlyTrend[];
    skillsBreakdown: SkillBreakdown[];
    recentFeedback: AnalyticsFeedback[];
}

