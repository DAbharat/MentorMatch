import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { computeSessionMetrices, shouldAutoCompleteSession } from "@/lib/session-metrics";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    const CRON_SECRET = process.env.CRON_SECRET

    if (!CRON_SECRET) {
        return NextResponse.json({
            message: "Cron secret is not configured"
        }, {
            status: 500
        })
    }

    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    try {
        const activeSessions = await prisma.session.findMany({
            where: {
                status: "IN_PROGRESS",
                callStartedAt: {
                    not: null
                },
                metricsComputedAt: null,
                completedBy: null
            }
        })

        let completedCount = 0

        const now = new Date()

        for (const session of activeSessions) {

            const metrics = await computeSessionMetrices(session.id)

            if(!metrics) continue;

            if (shouldAutoCompleteSession(metrics)) {
                await prisma.session.update({
                    where: {
                        id: session.id,
                        status: "IN_PROGRESS",
                        completedBy: null,
                        metricsComputedAt: null
                    },
                    data: {
                        status: "COMPLETED",
                        callEndedAt: now,
                        totalCallDuration: metrics.totalActiveMinutes,
                        mentorActiveMinutes: metrics.mentorActiveMinutes,
                        menteeActiveMinutes: metrics.menteeActiveMinutes,
                        metricsComputedAt: now,
                        completedBy: "Auto",
                    }
                })
                completedCount++
            }
        }
        return NextResponse.json({
            message: `Auto-completed ${completedCount} sessions`,
            completedCount: completedCount
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error auto-completing sessions:", error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}