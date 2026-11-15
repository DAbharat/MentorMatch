export interface RecommendedSkill {
    id: string;
    name: string;
}

export interface RecommendedMentor {
    id: string;
    name: string;
    bio: string | null;
    skillsOffered: RecommendedSkill[];
    matchedSkills: RecommendedSkill[];
    averageRating: number | null;
    ratingCount: number;
    completedSessionsCount: number;
    matchScore: number;
    bayesianRating?: number;
    confidenceGainAvg?: number;
}

export interface RecommendationsResponse {
    message: string;
    data: RecommendedMentor[];
    totalFound: number;
    hasWantedSkills: boolean;
}

