import { cacheStatsReport } from "@/lib/cache";
import { healthCheck } from "@/lib/redis";

export async function GET() {
    const stats = await cacheStatsReport()
    const health = await healthCheck()

    return Response.json({
        cache: stats,
        health
    })
}