import redis from "./redis";

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 3600;

const cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
}

export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        
        if(data) {
            cacheStats.hits++;
            console.log(`Cache HIT: ${key}`)
            return JSON.parse(data)
        } else {
            cacheStats.misses++;
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
        cacheStats.sets++;
        return true;
    } catch (error: any) {
        console.error("Cache SET error:", error.message);
        return false;
    }
}

export async function cacheDelete(key: string): Promise<boolean> {
    try {
        const result = await redis.del(key);
        cacheStats.deletes += result;
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
                cacheStats.deletes += deleted;
            }

        } while (cursor !== "0");

    } catch (error: any) {
        console.error("Cache INVALIDATE error:", error.message);
    }
}

export function cacheStatsReport() {
    const total = cacheStats.hits + cacheStats.misses;
    const hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0;

    return {
        ...cacheStats,
        hitRate: Number(hitRate.toFixed(2))
    }
}