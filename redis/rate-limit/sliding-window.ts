import redis from "../redis";
import { RateLimitResult } from "./tiers";

export async function slidingWindowLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - windowMs
    const windowSeconds = Math.ceil(windowMs / 1000)

    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    pipeline.expire(key, windowSeconds)

    const results = await pipeline.exec()
    const currentCount = (results?.[1]?.[1] as number) || 0
    if(currentCount >= limit) {
        await redis.zremrangebyscore(key, now, now)
        return {
            success: false,
            limit,
            remaining: 0,
            resetInSeconds: windowSeconds
        }
    }

    return {
        success: true,
        limit,
        remaining: Math.max(0, limit - (currentCount + 1)),
        resetInSeconds: windowSeconds
    }
}