import { cacheDelete, cacheGet, cacheSet } from "../cache";

const CACHE_PREFIX = "cache:v1";
const ANALYTICS_BASE_TTL= 300;

export function getAnalyticsCacheKey(userId: string) {
    return `${CACHE_PREFIX}:analytics:mentor:${userId}`
}

export async function getCachedMentorAnalytics<T>(userId: string): Promise<T | null> {
    const key = getAnalyticsCacheKey(userId)
    return await cacheGet<T>(key)
}

export async function setCachedMentorAnalytics(userId: string, data: any): Promise<void> {
    const key = getAnalyticsCacheKey(userId)
    const ttlWithJitter = ANALYTICS_BASE_TTL + Math.floor(Math.random() * 60)
    await cacheSet(key, data, ttlWithJitter)
}

export async function invalidateMentorAnalytics(userId: string): Promise<void> {
    const key = getAnalyticsCacheKey(userId)
    await cacheDelete(key)
    console.log(`[CACHE INVALIDATION] Cleared mentor analytics cache for user: ${userId}`)
}