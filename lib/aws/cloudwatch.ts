import "dotenv/config";
import {
  CloudWatchLogsClient, CreateLogGroupCommand, CreateLogStreamCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const region = process.env.AWS_REGION || "ap-southeast-2";

export const cloudWatchClient = new CloudWatchLogsClient({
    region,
    credentials: process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
})

export const LOG_GROUP_NAME = process.env.CLOUDWATCH_LOG_GROUP || "/mentormatch/app";
export const LOG_STREAM_NAME = `worker-${process.env.NODE_ENV || "development"}`;

let isLogStreamInitialized = false;

async function ensureLogStreamExists(): Promise<void> {
    if(isLogStreamInitialized) return;

    try {
        await cloudWatchClient.send(
            new CreateLogGroupCommand({
                logGroupName: LOG_GROUP_NAME
            })
        )
    } catch (error: any) {
        if(error.name !== "ResourceAlreadyExistsException") {
            console.warn("[CloudWatch] Log group check note: ", error.message)
        }
    }

    try {
        await cloudWatchClient.send(
            new CreateLogStreamCommand({
                logGroupName: LOG_GROUP_NAME,
                logStreamName: LOG_STREAM_NAME
            })
        )
    } catch (error: any) {
        if(error.name !== "ResourceAlreadyExistsException") {
            console.warn("[CloudWatch] Log stream check note: ", error.message)
        }
    }

    isLogStreamInitialized = true;
}

export type LogLevel = "INFO" | "WARN" | "ERROR";

export async function logToCloudWatch(
    message: string,
    level: LogLevel = "INFO",
    meta?: Record<string, any>
): Promise<void> {
    const timestamp = Date.now();
    const logPayload = {
        level, message, meta, timestamp: new Date(timestamp).toISOString()
    }

    // O/P to local terminal
    const consolePrefix = `[CloudWatch][${level}]${message}`
    if(level === "ERROR") {
        console.error(consolePrefix, meta || "")
    } else if(level === "WARN") {
        console.warn(consolePrefix, meta || "")
    } else {
        console.log(consolePrefix, meta || "")
    }

    // O/P to AWS CW Logs
    try {
        await ensureLogStreamExists();

        await cloudWatchClient.send(
            new PutLogEventsCommand({
                logGroupName: LOG_GROUP_NAME,
                logStreamName: LOG_STREAM_NAME,
                logEvents: [
                    {
                        message: JSON.stringify(logPayload),
                        timestamp
                    }
                ]
            })
        )
    } catch (error: any) {
        console.error("[CloudWatch] Failed to push log event: ", error.message)
    }
}