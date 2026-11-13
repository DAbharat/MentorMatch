import { getSessionFromRequest } from "@/lib/auth/auth";
import { MentorCandidate, scoreMentor, SkillFeedbackStats } from "@/lib/helpers/recommendation";
import prisma from "@/lib/prisma";
import { getCachedRecommendations, setCachedRecommendations } from "@/redis/cache/recommendations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const userId = getSessionFromRequest(request)
    if(!userId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 401
        })
    }

    try {
        const { searchParams } = new URL(request.url)
        let limit = Math.min(Number(searchParams.get("limit")) || 10, 50)
        if(limit < 0) limit = 0;

        const cached = await getCachedRecommendations(userId, limit)
        if(cached) {
            return NextResponse.json(
                cached, 
            {
                status: 200
            })
        }

        const mentee = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                skillsWanted: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        if(!mentee) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }
        if(mentee.skillsWanted.length === 0) {
            return NextResponse.json({
                message: "Please add skills you want to learn in your profile to receive recommendations.",
                data: [],
                hasWantedSkills: false
            })
        }

        const wantedSkillIds = mentee.skillsWanted.map((s) => s.id)
        const wantedSkillIdSet = new Set(wantedSkillIds)

        const candidateMentors = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                },
                skillsOffered: {
                    some: {
                        id: {
                            in: wantedSkillIds
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                bio: true,
                averageRating: true,
                ratingCount: true,
                skillsOffered: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        sessionsAsMentor: {
                            where: {
                                status: "COMPLETED"
                            }
                        }
                    }
                },
                feedbackReceived: {
                    where: {
                        skillId: {
                            in: wantedSkillIds
                        }
                    },
                    select: {
                        skillId: true,
                        rating: true,
                        confidenceBefore: true,
                        confidenceAfter: true
                    }
                }
            }
        })

        const scoredMentors = candidateMentors.map((m) => {
            const skillStatsMap = new Map<string, {
                ratingsSum: number;
                ratingsCount: number;
                totalGain: number;
                gainCount: number;
            }>();

            for (const fb of m.feedbackReceived) {
                let stats = skillStatsMap.get(fb.skillId)
                if(!stats) {
                    stats = {
                        ratingsSum: 0,
                        ratingsCount: 0,
                        totalGain: 0,
                        gainCount: 0
                    }
                    skillStatsMap.set(fb.skillId, stats)
                }

                stats.ratingsSum += fb.rating
                stats.ratingsCount += 1

                if(fb.confidenceBefore !== null && fb.confidenceAfter !== null) {
                    stats.totalGain += fb.confidenceAfter - fb.confidenceBefore
                    stats.gainCount += 1
                }
            }

            const topicFeedback: SkillFeedbackStats[] = Array.from(skillStatsMap.entries()).map(
                ([skillId, stats]) => ({
                    skillId,
                    ratingsCount: stats.ratingsCount,
                    averageRating: stats.ratingsCount > 0 ? stats.ratingsSum / stats.ratingsCount : 0,
                    totalConfidenceGain: stats.totalGain,
                    feedbackWithConfidenceCount: stats.gainCount
                })
            )

            const candidate: MentorCandidate = {
                id: m.id,
                name: m.name,
                bio: m.bio,
                skillsOffered: m.skillsOffered,
                averageRating: m.averageRating,
                ratingCount: m.ratingCount,
                completedSessionsCount: m._count.sessionsAsMentor,
                topicFeedback
            }

            return scoreMentor(candidate, wantedSkillIdSet)
        })

        scoredMentors.sort((a,b) => b.matchScore - a.matchScore)

        const topRecommendations = scoredMentors.slice(0, limit)

        const responsePayload = {
            message: "Recommendations fetched successfully",
            data: topRecommendations,
            totalFound: scoredMentors.length,
            hasWantedSkills: true
        }
        await setCachedRecommendations(userId, limit, responsePayload)

        return NextResponse.json(
            responsePayload, 
        {
            status: 200
        })
    } catch (error) {
        console.error("Error generating recommendations: ", error)
        return NextResponse.json({
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}