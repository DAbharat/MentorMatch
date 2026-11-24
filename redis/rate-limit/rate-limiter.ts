import { slidingWindowLimit } from "./sliding-window";
import { RATE_LIMIT_TIERS, RateLimitResult, TierName } from "./tiers";
import { tokenBucketLimit } from "./token-bucket";

export async function checkRateLimit(
    tierName: TierName,
    identifier: string
): Promise<RateLimitResult> {
    const tier = RATE_LIMIT_TIERS[tierName]
    const key = `ratelimit:${tierName.toLowerCase()}:${identifier}`

    try {
        if(tier.type === "sliding_window") {
            return await slidingWindowLimit(key, tier.limit, tier.windowMs)
        } else {
            return await tokenBucketLimit(key, tier.capacity, tier.refillRatePerSec)
        }
    } catch (error) {
        console.error(`[RateLimiter] Error on key: ${key}, failing open: `, error)
        return {
            success: true,
            limit: "limit" in tier ? tier.limit : tier.capacity,
            remaining: 1,
            resetInSeconds: 0
        }
    }
}