import path from "path";
import fs from "fs";
import { RateLimitResult } from "./tiers";
import redis from "../redis";

let tokenBucketLua: string | null = null;

function getLuaScript(): string {
    if(!tokenBucketLua) {
        const scriptPath = path.join(process.cwd(), "redis", "rate-limit", "token-bucket.lua")
        tokenBucketLua = fs.readFileSync(scriptPath, "utf-8")
    }
    return tokenBucketLua
}

export async function tokenBucketLimit(
    key: string,
    capacity: number,
    refillRatePerSec: number
): Promise<RateLimitResult> {
    const now = Date.now()
    const script = getLuaScript()

    const result = (await redis.eval(
        script, 1, key, capacity, refillRatePerSec, now
    )) as [number, number]

    const allowed = result[0] === 1
    const remainingTokens = result[1]
    const timeToFullRefill = Math.ceil((capacity - remainingTokens) / refillRatePerSec)

    return {
        success: allowed,
        limit: capacity,
        remaining: remainingTokens,
        resetInSeconds: timeToFullRefill
    }
}