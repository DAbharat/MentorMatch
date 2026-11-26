import "dotenv/config";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

const region = process.env.APP_AWS_REGION || "ap-southeast-2";

export const schedulerClient = new SchedulerClient({
    region,
    credentials: process.env.APP_AWS_ACCESS_KEY && process.env.APP_AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY
    } : undefined
})

export const AWS_SQS_QUEUE_ARN = process.env.AWS_SQS_QUEUE_ARN;
export const AWS_SCHEDULER_ARN = process.env.AWS_SCHEDULER_ARN;

export function formatEventBridgeAtExpression(date: Date): string {
    const isoWithoutMs = date.toISOString().split(".")[0];
    return `at(${isoWithoutMs})`;
}