import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { healthCheck } from "@/lib/redis";

const startTime = Date.now();

async function checkSocketIOHealth(): Promise<string> {
    try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        if (!socketUrl) {
            console.warn("NEXT_PUBLIC_SOCKET_URL not configured");
            return "unknown";
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${socketUrl}/health`, {
            method: "GET",
            signal: controller.signal
        });

        clearTimeout(timeout);

        return response.ok ? "ok" : "error";
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.error("Socket.io health check timed out");
        } else {
            console.error("Socket.io health check failed:", err);
        }
        return "error";
    }
}

export async function GET() {
    try {
        let dbStatus = "ok";
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (err) {
            dbStatus = "error";
            console.error("Database health check failed:", err);
        }

        const [redisHealth, socketioStatus] = await Promise.all([
            healthCheck(),
            checkSocketIOHealth()
        ]);
        
        const uptime = Math.floor((Date.now() - startTime) / 1000);

        const allHealthy = dbStatus === "ok" && redisHealth.status === "ok" && socketioStatus === "ok";
        const hasError = dbStatus === "error" || redisHealth.status === "error" || socketioStatus === "error";

        return NextResponse.json({
            status: hasError ? "degraded" : allHealthy ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                redis: redisHealth.status,
                socketio: socketioStatus
            },
            uptime,
            redis: {
                latency: redisHealth.latency
            }
        }, {
            status: hasError ? 503 : 200
        });

    } catch (error) {
        console.error("Health check error:", error);
        return NextResponse.json({
            status: "error",
            timestamp: new Date().toISOString(),
            services: {
                database: "error",
                redis: "error",
                socketio: "error"
            }
        }, {
            status: 500
        });
    }
}