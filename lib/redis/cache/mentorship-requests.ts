import { cacheDelete, cacheGet, cacheSet } from "../cache";

const CACHE_PREFIX = "cache:v1";
const REQUESTS_TTL = 300;

export function getRequestsCacheKey(userId: string, type: "received" | "sent") {
    return `${CACHE_PREFIX}:requests:${type}:${userId}`;
}

export async function getCachedRequests<T>(userId: string, type: "received" | "sent"): Promise<T | null> {
    return await cacheGet<T>(getRequestsCacheKey(userId, type));
}

export async function setCachedRequests(userId: string, type: "received" | "sent", data: any): Promise<void> {
    await cacheSet(getRequestsCacheKey(userId, type), data, REQUESTS_TTL)
}

export async function invalidateRequestParticipants(mentorId: string, menteeId: string): Promise<void> {
    await Promise.all([
        cacheDelete(getRequestsCacheKey(mentorId, "received")),
        cacheDelete(getRequestsCacheKey(menteeId, "sent"))
    ])
    console.log(`[CACHE INVALIDATION] Cleared requests cache for mentor: ${mentorId} and mentee: ${menteeId}`)
}