import { cacheStatsReport } from "@/lib/redis/cache";
import { healthCheck } from "@/lib/redis/redis";

export async function GET() {
    const stats = await cacheStatsReport()
    const health = await healthCheck()

    return Response.json({
        cache: stats,
        health
    })
}