import { Worker, Job } from "bullmq";
import { ComputeMetricsJobData, SESSION_QUEUE_NAME, SessionReminderJobData } from "./session.queue";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notification";
import { NotificationType } from "@prisma/client";
import { computeSessionMetrices, shouldAutoCompleteSession } from "@/lib/helpers/session-metrics";
import { invalidateMentorAnalytics } from "@/redis/cache/analytics";
import { invalidateSessionParticipants } from "@/redis/cache/sessions";
import { queueRedisConnection } from "@/queues/queue-connection";

async function handleSessionReminder(job: Job<SessionReminderJobData>) {
    const { sessionId } = job.data;
    console.log(`[Worker] Processing session reminder for session: ${sessionId}`)

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId
        },
        include: {
            mentor: {
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
            },
            skill: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    if(!session || session.status === "CANCELLED" || session.status === "COMPLETED") {
        console.log(`[Worker] Skipping reminder for session: ${sessionId} - status is ${session?.status || "NOT_FOUND"}.`)
        return
    }

    await prisma.notification.createMany({
        data: [
            {
                userId: session.mentorId,
                type: "SESSION_REMINDER",
                title: "Upcoming Mentoring Session",
                message: `You have an upcoming session with ${session.mentee.name} starting in 15 minutes.`,
            },
            {
                userId: session.menteeId,
                type: "SESSION_REMINDER",
                title: "Upcoming Mentoring Session",
                message: `Your session with ${session.mentor.name} starts in 15 minutes.`,
            },
        ],
    });

    console.log(`[Worker] Successfully sent SESSION_REMINDER notifications for session ${sessionId}`)
}

async function handleAutoCompleteCheck() {
    console.log("[Worker] Running scheduled auto-complete check for abandoned sessions...")

    const activeSessions = await prisma.session.findMany({
        where: {
            status: "IN_PROGRESS",
            callStartedAt: { not: null },
            metricsComputedAt: null,
            completedBy: null
        }
    })
    if(activeSessions.length === 0) return;

    let completedCount = 0
    const now = new Date()

    for (const session of activeSessions) {
        const metrics = await computeSessionMetrices(session.id)
        if(!metrics) continue

        if(shouldAutoCompleteSession(metrics)) {
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
                    totalActiveMinutes: metrics.totalActiveMinutes,
                    metricsComputedAt: now,
                    completedBy: "Auto",
                }
            })

            await Promise.all([
                invalidateMentorAnalytics(session.mentorId),
                invalidateSessionParticipants(session.mentorId, session.menteeId),
            ])

            completedCount++
            console.log(`[Worker] Auto-completed abandoned session: ${session.id} with completedBy: Auto.`)
        }
    }
    console.log(`[Worker] Auto-complete check finished. Completed ${completedCount} sessions.`)
}

async function handleComputeMetrics(job: Job<ComputeMetricsJobData>) {
    const { sessionId } = job.data
    console.log(`[Worker] Computing metrics in background for session: ${sessionId}`)

    const metrics = await computeSessionMetrices(sessionId)
    if(!metrics) return

    await prisma.session.update({
        where: {
            id: sessionId
        },
        data: {
            mentorActiveMinutes: metrics.mentorActiveMinutes,
            menteeActiveMinutes: metrics.menteeActiveMinutes,
            totalActiveMinutes: metrics.totalActiveMinutes,
            metricsComputedAt: new Date()
        }
    })

    console.log(`[Worker] Metrics computed and saved for session: ${sessionId}`)
}

export function createSessionWorker() {
    const worker = new Worker(SESSION_QUEUE_NAME,
        async(job: Job) => {
            switch(job.name) {
                case "send-session-reminder":
                    await handleSessionReminder(job)
                    break

                case "check-auto-complete-session":
                    await handleAutoCompleteCheck()
                    break

                case "compue-session-metrics":
                    await handleComputeMetrics(job)
                    break
                
                default:
                    console.warn(`[Worker] Unknown job name received: ${job.name}`)
            }
        },
        {
            connection: queueRedisConnection,
            concurrency: 5
        }
    )

    worker.on("completed", (job) => {
        console.log(`[Worker] Job: ${job.id} (${job.name}) completed successfully.`)
    })
    worker.on("failed", (job, error) => {
        console.log(`[Worker] Job: ${job?.id} (${job?.name}) failed with error:`, error.message)
    })
    worker.on("error", (error) => {
        console.error("[Worker] Worker encountered error:", error)
    })

    return worker
}