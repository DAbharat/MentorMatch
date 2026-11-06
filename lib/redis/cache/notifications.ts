import prisma from "@/lib/prisma";
import { cacheDelete, cacheGet, cacheSet } from "../cache";

const CACHE_PREFIX = "cache:v1";
const UNREAD_NOTIF_TTL = 600;

export function getUnreadNotificationKey(userId: string) {
    return `${CACHE_PREFIX}:user:unread_notifications:${userId}`;
}

export async function getUnreadNotificationCountCached(userId: string): Promise<number> {
    const cacheKey = getUnreadNotificationKey(userId);

    const cached = await cacheGet<number>(cacheKey)
    if(cached !== null && cached !== undefined) {
        return cached
    }

    const count = await prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    })

    await cacheSet(cacheKey, count, UNREAD_NOTIF_TTL);
    return count
}

export async function invalidateUnreadNotificationCount(userId: string) {
    const cacheKey = getUnreadNotificationKey(userId)
    await cacheDelete(cacheKey)
}

export async function resetUnreadNotificationCount(userId: string) {
    const cacheKey = getUnreadNotificationKey(userId);
    await cacheSet(cacheKey, 0, UNREAD_NOTIF_TTL)
}