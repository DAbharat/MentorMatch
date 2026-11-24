import { Queue } from "bullmq";
import { queueRedisConnection } from "@/redis/queue-connection";

export const SESSION_QUEUE_NAME = "session-tasks";

export interface SessionReminderJobData {
    sessionId: string;
}

export interface ComputeMetricsJobData {
    sessionId: string;
}

export interface AutoCompleteCheckJobData {
    timeStamp?: number;
}

declare global {
    var sessionQueue: Queue | undefined;
}

export const sessionQueue = global.sessionQueue || new Queue(SESSION_QUEUE_NAME, {
    connection: queueRedisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600
        }
    }
})
if(process.env.NODE_ENV !== "production") {
    global.sessionQueue = sessionQueue
}

export async function scheduleSessionReminder(sessionId: string, scheduledAt: Date) {
    const reminderTime = new Date(scheduledAt).getTime() - 15 * 60 * 1000;
    const delay = Math.max(0, reminderTime - Date.now());

    const jobId = `reminder-${sessionId}`

    try {
        const existingJob = await sessionQueue.getJob(jobId)
        if(existingJob) {
            await existingJob.remove()
        }
    } catch (error) {
        console.error(`Could not check existing reminder job for session: ${sessionId}:`, error)
    }

    await sessionQueue.add("send-session-reminder", {
        sessionId
    } as SessionReminderJobData,
    {
        delay,
        jobId
    })

    console.log(`[BullMQ] Scheduled session reminder for session: ${sessionId} in ${Math.round(delay / 60000)} minutes.`)
}

export async function cancelSessionReminder(sessionId: string) {
    const jobId = `reminder-${sessionId}`;
    try {
        const job = await sessionQueue.getJob(jobId)
        if(job) {
            await job.remove()
            console.log(`[BullMQ] Cancelled reminder job for session: ${sessionId}.`)
        }
    } catch (error) {
        console.error(`[BullMQ] Failed to cancel reminder for session: ${sessionId}:`, error)
    }
}

export async function queueComputeSessionMetrics(sessionId: string) {
    await sessionQueue.add("compute-session-metrics",
        { sessionId } as ComputeMetricsJobData,
        {
            jobId: `metrics-${sessionId}-${Date.now()}`
        }
    )
}

export async function setupRecurringAutoCompleteJob() {
    await sessionQueue.upsertJobScheduler("recurring-auto-complete-job",
        {
            every: 2 * 60 * 1000,
        },
        {
            name: "check-auto-complete-sessions",
            data: {} as AutoCompleteCheckJobData,
        }
    )
}