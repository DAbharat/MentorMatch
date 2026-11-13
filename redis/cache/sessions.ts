import { cacheDelete, cacheGet, cacheSet } from "../cache";

const CACHE_PREFIX = "cache:v1";
const SESSION_TTL = 300;

export function getUserSessionsCacheKey(userId: string) {
    return `${CACHE_PREFIX}:user:sessions:${userId}`;
}

export async function getCachedUserSessions<T>(userId: string): Promise<T | null> {
    const key = getUserSessionsCacheKey(userId)
    return await cacheGet(key)
}

export async function setCachedUserSessions(userId: string, data: any): Promise<void> {
    const key = getUserSessionsCacheKey(userId)
    await cacheSet(key, data, SESSION_TTL)
}

export async function invalidateSessionParticipants(mentorId: string, menteeId: string): Promise<void> {
    await Promise.all([
        cacheDelete(getUserSessionsCacheKey(mentorId)),
        cacheDelete(getUserSessionsCacheKey(menteeId))
    ])
    console.log(`[CACHE INVALIDATION] Cleared session cache for mentor: ${mentorId} and mentee: ${menteeId}`)
}