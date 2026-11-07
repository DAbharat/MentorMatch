import redis from "../redis";

const PRESENCE_TTL_SECONDS = 60;

export function getRoomPresenceKey(roomId: string) {
    return `session:room:active:${roomId}`;
}

export async function markUserInRoom(roomId: string, userId: string): Promise<void> {
    const key = getRoomPresenceKey(roomId)
    await redis.sadd(key, userId)
    await redis.expire(key, PRESENCE_TTL_SECONDS)
}

export async function removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const key = getRoomPresenceKey(roomId)
    await redis.srem(key, userId)
}

export async function getActiveRoomUsers(roomId: string): Promise<string[]> {
    const key = getRoomPresenceKey(roomId)
    return await redis.smembers(key)
}

export async function isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const key = getRoomPresenceKey(roomId)
    const isMember = await redis.sismember(key, userId)
    return isMember === 1;
}

export async function refreshRoomHeartbeat(roomId: string): Promise<void> {
    const key = getRoomPresenceKey(roomId)
    await redis.expire(key, PRESENCE_TTL_SECONDS)
}