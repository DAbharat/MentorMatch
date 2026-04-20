import redis from "./redis";

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 3600;
const CACHE_PREFIX = "cache:v1";
const STATS_KEY = `${CACHE_PREFIX}:stats`

export function buildCacheKey(
    domain: string,
    entity: string,
    id: string
) {
    return `${CACHE_PREFIX}:${domain}:${entity}:${id}`
}

export function buildChatCacheKey(
    chatId: string,
    cursor: string | null,
    limit: number
) {
    return `${CACHE_PREFIX}:chat:messages:${chatId}:${cursor || "first"}:${limit}`
}

export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        
        if(data) {
            await redis.hincrby(STATS_KEY, "hits", 1)
            console.log(`Cache HIT: ${key}`)
            return JSON.parse(data)
        } else {
            await redis.hincrby(STATS_KEY, "misses", 1)
            console.log(`Cache MISS: ${key}`)
            return null;
        }

    } catch (error: any) {
        console.error("Cache GET error:", error.message);
        return null;
    }
}

export async function cacheExists(key: string): Promise<boolean> {
    try {
        const exists = await redis.exists(key);
        return exists === 1;
    } catch (error: any) {
        console.error("Cache EXISTS error:", error.message);
        return false;
    }
}

export async function cacheSet(
    key: string,
    value: any,
    ttl: number = DEFAULT_TTL
): Promise<boolean> {
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
        await redis.hincrby(STATS_KEY, "sets", 1)
        return true;
    } catch (error: any) {
        console.error("Cache SET error:", error.message);
        return false;
    }
}

export async function cacheDelete(key: string): Promise<boolean> {
    try {
        const deleted = await redis.del(key);
        await redis.hincrby(STATS_KEY, "deletes", deleted)
        return true;
    } catch (error: any) {
        console.error("Cache DELETE error:", error.message);
        return false;
    }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
    try {

        let cursor = "0";

        do {
            const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);

            cursor = nextCursor;

            if (keys.length > 0) {
                const deleted = await redis.del(...keys);
                await redis.hincrby(STATS_KEY, "deletes", deleted)
            }

        } while (cursor !== "0");

    } catch (error: any) {
        console.error("Cache INVALIDATE error:", error.message);
    }
}

export async function cacheStatsReport() {
    const stats = await redis.hgetall(STATS_KEY)

    const hits = Number(stats.hits || 0)
    const misses = Number(stats.misses || 0)
    const sets = Number(stats.sets || 0)
    const deletes = Number(stats.deletes || 0)

    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    return {
        hits,
        misses,
        sets,
        deletes,
        hitRate: Number(hitRate.toFixed(2))
    }
}