import { logToCloudWatch } from "@/lib/aws/cloudwatch";
import { SQS_QUEUE_URL, sqsClient } from "@/lib/aws/sqs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { CreateScheduleCommand, UpdateScheduleCommand, DeleteScheduleCommand, FlexibleTimeWindowMode, ActionAfterCompletion } from "@aws-sdk/client-scheduler";
import { AWS_SCHEDULER_ARN, AWS_SQS_QUEUE_ARN, formatEventBridgeAtExpression, schedulerClient } from "@/lib/aws/scheduler";

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
    const reminderTime = new Date(new Date(scheduledAt).getTime() - 15 * 60 * 1000);
    if(reminderTime.getTime() <= Date.now()) {
        await sendSQSMessage<SessionReminderJobData>("send-session-reminder", { sessionId }, 0)
        console.log(`[SQS] Session: ${sessionId} begins in <= 15 mins. Reminder sent immediately.`)
        return
    }

    if(!AWS_SQS_QUEUE_ARN || !AWS_SCHEDULER_ARN) {
        throw new Error("[Scheduler] Missing AWS_SQS_ARN or AWS_SCHEDULER_ARN in .env")
    }

    const scheduleName = `session-reminder-${sessionId}`;
    const sqsMessageBody: SessionQueueMessage<SessionReminderJobData> = {
        task: "send-session-reminder",
        payload: { sessionId },
        timestamp: Date.now()
    }

    const scheduleConfig = {
        Name: scheduleName,
        ScheduleExpression: formatEventBridgeAtExpression(reminderTime),
        ScheduleExpressionTimezone: "UTC",
        FlexibleTimeWindow: {
            Mode: FlexibleTimeWindowMode.OFF
        },
        ActionAfterCompletion: ActionAfterCompletion.DELETE,
        Target: {
            Arn: AWS_SQS_QUEUE_ARN,
            RoleArn: AWS_SCHEDULER_ARN,
            Input: JSON.stringify(sqsMessageBody)
        }
    }

    try {
        await schedulerClient.send(new CreateScheduleCommand(scheduleConfig))
    } catch (error: any) {
        if(error.name === "ConflictException") {
            await schedulerClient.send(new UpdateScheduleCommand(scheduleConfig))
        } else {
            throw error;
        }
    }

    await logToCloudWatch(`[Scheduler] Reminder scheduled for ${reminderTime.toISOString()}`, "INFO", {
        sessionId, scheduleName
    })
}

export async function cancelSessionReminder(sessionId: string): Promise<void> {
    const scheduleName = `session-reminder-${sessionId}`;

    try {
        await schedulerClient.send(new DeleteScheduleCommand({ Name: scheduleName }))
        await logToCloudWatch(`[Scheduler] Cancelled reminder schedule: ${scheduleName}`, "INFO", {
            sessionId
        })
    } catch (error: any) {
        if(error.name === "ResourceNotFoundException") {
            console.log(`[Scheduler] No active schedule found for session: ${sessionId} (already fired or none existed).`)
        } else {
            console.error(`[Scheduler] Failed to cancel schedule for ${sessionId}: `, error.message)
        }
    }
}