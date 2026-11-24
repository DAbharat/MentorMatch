import { register } from "@/lib/auth/auth";
import { checkRateLimit } from "@/redis/rate-limit/rate-limiter";
import { getClientIp, rateLimitExceededResponse } from "@/redis/rate-limit/utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit("AUTH", ip);
    if (!rateLimitResult.success) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    return register(req);
}