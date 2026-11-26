import { logToCloudWatch } from "@/lib/aws/cloudwatch";
import { SQS_QUEUE_URL, sqsClient } from "@/lib/aws/sqs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export type SessionTaskType = "compute-session-metrics" | "send-session-reminder" | "check-auto-complete-sessions";

export interface SessionQueueMessage<T = any> {
    task: SessionTaskType;
    payload: T;
    timestamp: number;
}

export interface SessionReminderJobData {
    sessionId: string;
}

export interface ComputeMetricsJobData {
    sessionId: string;
}

export interface AutoCompleteCheckJobData {
    timeStamp?: number;
}

export async function sendSQSMessage<T>(
    task: SessionTaskType,
    payload: T,
    delaySeconds: number = 0
): Promise<string | undefined> {
    if(!SQS_QUEUE_URL) {
        throw new Error("[SQS] Cannot send message: SQS_QUEUE_URL is not set.")
    }

    const messageBody: SessionQueueMessage<T> = {
        task, payload, timestamp: Date.now()
    }

    const sanitizedDelay = Math.min(900, Math.max(0, Math.floor(delaySeconds)))
    const command = new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MessageBody: JSON.stringify(messageBody),
        DelaySeconds: sanitizedDelay,
        MessageAttributes: {
            TaskType: {
                DataType: "String",
                StringValue: task
            }
        }
    })

    const response = await sqsClient.send(command)

    await logToCloudWatch(`[SQS] Message sent: ${task}`, "INFO", {
        task,
        messageId: response.MessageId,
        delaySeconds: sanitizedDelay
    })

    return response.MessageId;
}

export async function queueComputeSessionMetrics(sessionId: string): Promise<string | undefined> {
    return sendSQSMessage<ComputeMetricsJobData>("compute-session-metrics", { sessionId })
}

export async function scheduleSessionReminder(sessionId: string, scheduledAt: Date): Promise<void> {
    const reminderTime = new Date(scheduledAt).getTime() - 15 * 60 * 1000;
    const delayMs = reminderTime - Date.now();
    const delaySeconds = Math.floor(delayMs / 1000);

    if(delaySeconds >= 0 && delaySeconds <= 900) {
        await sendSQSMessage<SessionReminderJobData>("send-session-reminder", { sessionId }, delaySeconds)
        console.log(`[SQS] Reminder scheduled in SQS with ${delaySeconds}s delay for session: ${sessionId}.`)
    } else if(delaySeconds < 0) {
        await sendSQSMessage<SessionReminderJobData>("send-session-reminder", { sessionId }, 0)
        console.log(`[SQS] Session: ${sessionId} begins soon. Reminder sent immediately.`)
    } else {
        console.log(`[SQS] Session: ${sessionId} is scheduled ${Math.round(delaySeconds / 60)} mins in the future. Worker sweeper will trigger reminder.`)
    }
}

export async function cancelSessionReminder(sessionId: string): Promise<void> {
    console.log(`[SQS] Session: ${sessionId} cancelled/updated. Worker will ignore any pending reminders.`)
}