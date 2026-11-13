import { getSessionFromRequest } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { getCachedMentorAnalytics, setCachedMentorAnalytics } from "@/redis/cache/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const userId = getSessionFromRequest(request)
    if(!userId) {
        return NextResponse.json({
            message: "unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const cached = await getCachedMentorAnalytics(userId)
        if(cached) {
            return NextResponse.json(
                cached,
            {
                status: 200
            })
        }

        const now = new Date()
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(now.getMonth() - 5)
        sixMonthsAgo.setDate(1)
        sixMonthsAgo.setHours(0,0,0,0)

        const [user, sessionStats, uniqueMentees, recentSessionsForTrends, allFeedback, skillSessions] = await Promise.all([
            //mentor profile and offered skills
            prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    id: true,
                    name: true,
                    averageRating: true,
                    ratingCount: true,
                    skillsOffered: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),

            //group sessions by status with total durations
            prisma.session.groupBy({
                by: ["status"],
                where: {
                    mentorId: userId
                },
                _count: {
                    _all: true
                },
                _sum: {
                    mentorActiveMinutes: true,
                    totalCallDuration: true
                }
            }),

            //count unique mentees mentored in completed sessions
            prisma.session.findMany({
                where: {
                    mentorId: userId,
                    status: "COMPLETED"
                },
                distinct: ["menteeId"],
                select: {
                    menteeId: true
                }
            }),

            //completed sessions in the last 6 months for trend chart
            prisma.session.findMany({
                where: {
                    mentorId: userId,
                    status: "COMPLETED",
                    scheduledAt: {
                        gte: sixMonthsAgo
                    }
                },
                select: {
                    scheduledAt: true,
                    menteeActiveMinutes: true
                },
                orderBy: {
                    scheduledAt: "asc"
                }
            }),

            //all feedback received with skills and mentee details
            prisma.userFeedback.findMany({
                where: {
                    mentorId: userId
                },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    confidenceBefore: true,
                    confidenceAfter: true,
                    createdAt: true,
                    skill: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    mentee: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),

            //completed sessions grouped by skill
            prisma.session.groupBy({
                by: ["skillId"],
                where: {
                    mentorId: userId,
                    status: "COMPLETED"
                },
                _count: {
                    _all: true
                },
                _sum: {
                    mentorActiveMinutes: true
                }
            })
        ])

        if(!user) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        //1: Process session status and Total minutes
        let totalCompletedSessions = 0;
        let totalActiveMinutes = 0;
        let upcomingSessionsCount = 0;
        let cancelledSessionsCount = 0;

        sessionStats.forEach((group) => {
            const count = group._count._all
            if(group.status === "COMPLETED") {
                totalCompletedSessions = count;
                totalActiveMinutes = (group._sum.mentorActiveMinutes || group._sum.totalCallDuration || 0)
            } else if(group.status === "CONFIRMED" || group.status === "PENDING") {
                upcomingSessionsCount += count
            } else if(group.status === "CANCELLED") {
                cancelledSessionsCount = count
            }
        })

        //2: Process rating and Confidence gain metrics
        const ratingDistribution: Record<number, number> = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
        let totalConfidenceGain = 0;
        let confidenceGainCount = 0;

        allFeedback.forEach((fb) => {
            if(fb.rating >= 1 && fb.rating <= 5) {
                ratingDistribution[fb.rating] = (ratingDistribution[fb.rating] || 0) + 1
            }
            if(fb.confidenceBefore !== null && fb.confidenceAfter !== null) {
                totalConfidenceGain += fb.confidenceAfter - fb.confidenceBefore
                confidenceGainCount += 1
            }
        })
        const averageConfidenceGain = confidenceGainCount > 0 ? Number((totalConfidenceGain / confidenceGainCount).toFixed(1)) : null

        //3: Process 6-Month monthly trend
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTrendMap = new Map<string, { label: string; sessions: number; minutes: number }>();

        for (let i=5; i>=0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            const label = `${monthNames[d.getMonth()]}`

            monthlyTrendMap.set(key, {
                label, sessions: 0, minutes: 0
            })
        }

        recentSessionsForTrends.forEach((sess) => {
            const d = new Date(sess.scheduledAt)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            const bucket = monthlyTrendMap.get(key)
            if(bucket) {
                bucket.sessions += 1
                bucket.minutes += sess.menteeActiveMinutes || 0
            }
        })

        const monthlyTrends = Array.from(monthlyTrendMap.values())

        //4: Process skill performance breakdown
        const skillNameMap = new Map<string, string>()
        user.skillsOffered.forEach((s) => skillNameMap.set(s.id, s.name))

        const skillsBreakdown = skillSessions.map((group) => {
            const skillName = skillNameMap.get(group.skillId) || "Other"
            const skillFeedback = allFeedback.filter((fb) => fb.skill.id === group.skillId)
            const avgRating = skillFeedback.length > 0 ? Number((skillFeedback.reduce((acc, curr) => acc + curr.rating, 0) / skillFeedback.length).toFixed(1)) : null

            return {
                skillId: group.skillId,
                skillName,
                completedSessions: group._count._all,
                totalMinutes: group._sum.mentorActiveMinutes || 0,
                feedbackCount: skillFeedback.length,
                averageRating: avgRating
            }
        }).sort((a, b) => b.completedSessions - a.completedSessions)

        const payload = {
            overview: {
                totalCompletedSessions,
                totalActiveHours: Number((totalActiveMinutes / 60).toFixed(1)),
                totalActiveMinutes,
                uniqueMenteesCount: uniqueMentees.length,
                upcomingSessionsCount,
                cancelledSessionsCount,
                averageRating: user.averageRating ? Number(user.averageRating.toFixed(1)) : null,
                totalReviewsCount: user.ratingCount || allFeedback.length,
                averageConfidenceGain
            },
            ratingDistribution,
            monthlyTrends,
            skillsBreakdown,
            recentFeedback: allFeedback.slice(0, 10)
        }
        await setCachedMentorAnalytics(userId, payload)

        return NextResponse.json(
            payload, 
        {
            status: 200
        })
    } catch (error) {
        console.error("[Mentor Analytics API Error]: ", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}