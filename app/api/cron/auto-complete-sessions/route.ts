import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    const CRON_SECRET = process.env.CRON_SECRET
      
    if(!CRON_SECRET) {
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
        const now = new Date()

        const activeSessions = await prisma.session.findMany({
            where: {
                status: "IN_PROGRESS",
                callStartedAt: {
                    not: null
                }
            }
        })

        let completedCount = 0

        for(const session of activeSessions) {
            const elapsedTime = Math.floor(
                (now.getTime() - session.callStartedAt?.getTime()!) / 60000
            )

            if(elapsedTime >= 30 && session.status === "IN_PROGRESS") {
                await prisma.session.update({
                    where: {
                        id: session.id
                    },
                    data: {
                        status: "COMPLETED",
                        callEndedAt: now,
                        totalCallDuration: elapsedTime,
                        completedBy: "Auto"
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