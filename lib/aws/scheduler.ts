import "dotenv/config";
import { SchedulerClient } from "@aws-sdk/client-scheduler";

const region = process.env.AWS_REGION || "ap-southeast-2";

export const schedulerClient = new SchedulerClient({
    region,
    credentials: process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
})

export const AWS_SQS_QUEUE_ARN = process.env.AWS_SQS_QUEUE_ARN;
export const AWS_SCHEDULER_ARN = process.env.AWS_SCHEDULER_ARN;

export function formatEventBridgeAtExpression(date: Date): string {
    const isoWithoutMs = date.toISOString().split(".")[0];
    return `at(${isoWithoutMs})`;
}