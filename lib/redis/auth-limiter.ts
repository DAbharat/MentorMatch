import redis from "./redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_TTL_SECONDS = 15 * 60;

export function getLoginRateLimitKey(email: string) {
    const normalized = email.trim().toLowerCase();
    return `ratelimit:login:${normalized}`;
}

export async function isAccountLocked(email: string): Promise<boolean> {
    const key = getLoginRateLimitKey(email)
    const attempts = await redis.get(key)
    return attempts !== null && Number(attempts) >= MAX_ATTEMPTS;
}

export async function recordFailedLogin(email: string): Promise<number> {
    const key = getLoginRateLimitKey(email)
    const attempts = await redis.incr(key)
    if(attempts === 1) {
        await redis.expire(key, LOCKOUT_TTL_SECONDS)
    }

    return attempts;
}

export async function resetFailedLogin(email: string): Promise<void> {
    const key = getLoginRateLimitKey(email)
    await redis.del(key);
}