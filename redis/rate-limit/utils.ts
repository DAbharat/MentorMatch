import { NextResponse } from "next/server"
import { RateLimitResult } from "./tiers"

export function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for")
    if(forwarded) {
        return forwarded.split(",")[0].trim()
    }

    const realIp = req.headers.get("x-real-ip")
    if(realIp) {
        return realIp.trim()
    }

    return "127.0.0.1"
}

export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
    return NextResponse.json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${result.resetInSeconds} seconds.`
    }, {
        status: 429,
        headers: {
            "X-RateLimit-limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetInSeconds.toString(),
            "Retry-After": result.resetInSeconds.toString()
        }
    })
}

export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
    response.headers.set("X-RateLimit-Limit", result.limit.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.resetInSeconds.toString())
    return response
}