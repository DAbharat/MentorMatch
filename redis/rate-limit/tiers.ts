export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetInSeconds: number;
}

export const RATE_LIMIT_TIERS = {
    AUTH: {
        type: "sliding_window" as const,
        limit: 5,
        windowMs: 60 * 1000,
    },
    RECOMMENDATION: {
        type: "sliding_window" as const,
        limit: 15,
        windowMs: 60 * 1000,
    },
    MUTATION: {
        type: "sliding_window" as const,
        limit: 30,
        windowMs: 60 * 1000,
    },
    GENERAL: {
        type: "token_bucket" as const,
        capacity: 60,
        refillRatePerSec: 1,
    }
} as const;

export type TierName = keyof typeof RATE_LIMIT_TIERS;