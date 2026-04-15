import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {

    const userId = getSessionFromRequest(req)
    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 401
        });
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!userExists) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        const stuckSessions = await prisma.session.findMany({
            where: {
                status: "IN_PROGRESS",
                mentorId: userId,
                metricsComputedAt: null
            },
            include: {
                mentor: true,
                mentee: true,
                skill: true
            }
        });

        if (stuckSessions.length === 0) {
            return NextResponse.json({
                message: "No stuck sessions found",
                completedCount: 0
            }, {
                status: 200
            });
        }

        const now = new Date();
        let completedCount = 0;

        for (const session of stuckSessions) {
            await prisma.session.update({
                where: {
                    id: session.id
                },
                data: {
                    status: "COMPLETED",
                    callEndedAt: now,
                    metricsComputedAt: now,
                    completedBy: "Auto",
                    totalCallDuration: session.totalCallDuration || 0,
                }
            });
            completedCount++;
        }

        return NextResponse.json({
            message: `Completed ${completedCount} stuck sessions`,
            completedCount,
            sessions: stuckSessions.map(s => ({
                id: s.id,
                skill: s.skill.name,
                mentee: s.mentee.name
            }))
        }, {
            status: 200
        }
        );
    } catch (error) {
        console.error("Error cleaning up stuck sessions:", error);
        return NextResponse.json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 500
        });
    }
}
