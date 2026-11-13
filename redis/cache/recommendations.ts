import { cacheDelete, cacheGet, cacheSet } from "../cache";

const CACHE_PREFIX = "cache:v1";
const RECOMMENDATIONS_BASE_TTL = 600;

export function getRecommendationCacheKey(userId: string, limit: number) {
    return `${CACHE_PREFIX}:recommendations:${userId}:${limit}`;
}

export async function getCachedRecommendations<T>(userId: string, limit: number): Promise<T | null> {
    const key = getRecommendationCacheKey(userId, limit)
    return await cacheGet<T>(key)
}

export async function setCachedRecommendations(userId: string, limit: number, data: any): Promise<void> {
    const key = getRecommendationCacheKey(userId, limit)
    const ttlWithJitter = RECOMMENDATIONS_BASE_TTL + Math.floor(Math.random() * 60)
    await cacheSet(key, data, ttlWithJitter)
}

export async function invalidateUserRecommendations(userId: string, defaultLimit = 10): Promise<void> {
    const defaultKey = getRecommendationCacheKey(userId, defaultLimit)
    await cacheDelete(defaultKey)
    console.log(`[CACHE INVALIDATION] Cleared recommendations for user: ${userId}`)
}