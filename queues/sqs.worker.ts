import { computeSessionMetrices, shouldAutoCompleteSession } from "@/lib/helpers/session-metrics";
import prisma from "@/lib/prisma";
import { invalidateMentorAnalytics } from "@/redis/cache/analytics";
import { invalidateSessionParticipants } from "@/redis/cache/sessions";
import { DeleteMessageCommand, Message, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { SessionQueueMessage } from "./sqs.producer";
import { logToCloudWatch } from "@/lib/aws/cloudwatch";
import { SQS_QUEUE_URL, sqsClient } from "@/lib/aws/sqs";
import { error } from "console";

let isRunning = true;

async function handleSessionReminder(sessionId: string) {
    console.log(`[Worker] Processing session reminder for session: ${sessionId}`)

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId
        },
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                }
            },
            mentee: {
                select: {
                    id: true,
                    name: true,
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
        console.log(`[Worker] Skipping reminder for session: ${sessionId} status: ${session?.status || "NOT_FOUND"}`)
        return
    }

    await prisma.notification.createMany({
        data: [
            {
                userId: session.mentorId,
                type: "SESSION_REMINDER",
                title: "Upcoming Mentoring Session",
                message: `You have an upcoming session with ${session.mentee.name} starting in 15 minutes.`
            },
            {
                userId: session.menteeId,
                type: "SESSION_REMINDER",
                title: "Upcoming Mentoring Session",
                message: `Your session with ${session.mentor.name} starts in 15 minutes.`
            }
        ]
    })

    console.log(`[Worker] Successfully sent SESSION_REMINDER notifications for session: ${sessionId}`)
}

async function handleComputeMetrics(sessionId: string) {
    console.log(`[Worker] Computing metrics for session: ${sessionId}`)

    const metrics = await computeSessionMetrices(sessionId)
    if(!metrics) return;

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

export async function handlleAutoCompleteCheck() {
    console.log("[Worker] Checking for abandoned sessions to auto-complete...")

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
    if(activeSessions.length === 0) return;

    let completedCount = 0;
    const now = new Date();

    for(const session of activeSessions) {
        const metrics = await computeSessionMetrices(session.id)
        if(!metrics) return;

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
                    completedBy: "Auto"
                }
            })

            await Promise.all([
                invalidateMentorAnalytics(session.mentorId),
                invalidateSessionParticipants(session.mentorId, session.menteeId)
            ])

            completedCount++;
            console.log(`[Worker] Auto-completed abandoned session: ${session.id}`)
            if(completedCount > 0) {
                console.log(`[Worker] Auto-completed finished. Closed ${completedCount} sessions.`)
            }
        }
    }
}

async function processMessage(message: Message) {
    if(!message.Body) return;

    const parsed: SessionQueueMessage = JSON.parse(message.Body);
    const { task, payload } = parsed;
    
    console.log(`[Worker] Received task: ${task} (MessageId: ${message.MessageId})`)

    switch(task) {
        case "compute-session-metrics":
            await handleComputeMetrics(payload.sessionId)
            break

        case "send-session-reminder":
            await handleSessionReminder(payload.sessionId)
            break

        case "check-auto-complete-sessions":
            await handlleAutoCompleteCheck()
            break

        default:
            throw new Error(`Unknown task type: ${task}`)
    }
}

export async function startSQSWorker() {
    console.log("[Worker Process] SQS Worker is listening for messages...")
    await logToCloudWatch("[Worker Process] SQS Worker started listening", "INFO")

    const autoCompleteInterval = setInterval(async() => {
        try {
            await handlleAutoCompleteCheck()
        } catch (error: any) {
            console.error("[Worker] Auto-complete error: ", error.message)
        }
    }, 2 * 60 * 1000)

    while(isRunning) {
        try {
            const response = await sqsClient.send(
                new ReceiveMessageCommand({
                    QueueUrl: SQS_QUEUE_URL,
                    MaxNumberOfMessages: 5,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 30
                })
            )

            const messages = response.Messages || [];
            for(const message of messages) {
                try {
                    await processMessage(message)

                    await sqsClient.send(
                        new DeleteMessageCommand({
                            QueueUrl: SQS_QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle!
                        })
                    )

                    await logToCloudWatch(`[Worker] Job completed & deleted: ${message.MessageId}`, "INFO")
                } catch (jobError: any) {
                    console.error(`[Worker] Job failed: ${message.MessageId}`, jobError.message)
                    await logToCloudWatch(`[Worker] Job failed: ${message.MessageId}`, "ERROR", {
                        error: jobError.message
                    })
                }
            }
        } catch (pollError: any) {
            if(!isRunning) break;
            console.error("[Worker] Error polling SQS: ", pollError.message)
            await new Promise((resolve) => setTimeout(resolve, 3000))
        }
    }

    clearInterval(autoCompleteInterval)
    console.log("[Worker Process] Worker loop terminated cleanly.")
}

export function stopSQSWorker() {
    isRunning = false;
}