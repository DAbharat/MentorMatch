export interface SkillFeedbackStats {
    skillId: string;
    ratingsCount: number;
    averageRating: number;
    totalConfidenceGain: number;
    feedbackWithConfidenceCount: number;
}

export interface MentorCandidate {
    id: string;
    name: string;
    bio: string | null;
    skillsOffered: Array<{ id: string; name: string}>
    averageRating: number | null;
    ratingCount: number;
    completedSessionsCount: number;
    topicFeedback: SkillFeedbackStats[];
}

export interface ScoredMentor extends MentorCandidate {
    matchScore: number;
    matchedSkills: Array<{ id: string; name: string }>;
    bayesianRating: number;
    confidenceGainAvg: number;
}

const PRIOR_PLATFORM_MEAN = 4.0;
const MIN_REVIEWS_THRESHOLD = 5;

export function calculateBayesianRating(
    avgRating: number,
    reviewCount: number,
    priorMean = PRIOR_PLATFORM_MEAN,
    minThreshold = MIN_REVIEWS_THRESHOLD
): number {
    if(reviewCount == 0) {
        return priorMean;
    }

    return (
        (reviewCount / (reviewCount + minThreshold)) * avgRating + (minThreshold / (reviewCount + minThreshold)) * priorMean
    )
}

export function calculateSkillRelevance(
    matchedCount: number,
    menteeWantedCount: number
): number {
    if(menteeWantedCount === 0) return 0;
    return Math.min(100, (matchedCount / menteeWantedCount) * 100);
}

export function calculateConfidenceImpact(
    totalGain: number,
    sessionsWithConfidenceCount: number
): number {
    if(sessionsWithConfidenceCount === 0) {
        return 50;
    }
    
    const avgGain = totalGain / sessionsWithConfidenceCount;
    return Math.max(0, Math.min(100, (avgGain / 5) * 100));
}

export function scoreMentor(
    mentor: MentorCandidate,
    menteeWantedSkillIds: Set<string>
): ScoredMentor {
    const matchedSkills = mentor.skillsOffered.filter((s) => 
        menteeWantedSkillIds.has(s.id)
    )

    const relevanceScore = calculateSkillRelevance(
        matchedSkills.length,
        menteeWantedSkillIds.size
    )

    const relevantTopicFeedbacks = mentor.topicFeedback.filter((tf) => 
        menteeWantedSkillIds.has(tf.skillId)
    )

    let totalRatings = 0;
    let weightedRatingSum = 0;
    let totalConfidenceGain = 0;
    let totalSessionsWithConfidence = 0;

    for(const tf of relevantTopicFeedbacks) {
        totalRatings += tf.ratingsCount;
        weightedRatingSum += tf.averageRating * tf.ratingsCount;
        totalConfidenceGain += tf.totalConfidenceGain;
        totalSessionsWithConfidence += tf.feedbackWithConfidenceCount;
    }

    const topicAvgRating = totalRatings > 0 ? weightedRatingSum / totalRatings : PRIOR_PLATFORM_MEAN;

    const bayesianRating = calculateBayesianRating(topicAvgRating, totalRatings);
    const normalizedRatingScore = ((bayesianRating - 1) / 4) * 100;

    const impactScore = calculateConfidenceImpact(
        totalConfidenceGain,
        totalSessionsWithConfidence
    )

    const compositeScore = relevanceScore * 0.4 + normalizedRatingScore * 0.4 + impactScore * 0.2;

    return {
        ...mentor,
        matchScore: Number(compositeScore.toFixed(1)),
        matchedSkills,
        bayesianRating: Number(bayesianRating.toFixed(2)),
        confidenceGainAvg: totalSessionsWithConfidence > 0 ? Number((totalConfidenceGain / totalSessionsWithConfidence).toFixed(1)) : 0,
    }
}