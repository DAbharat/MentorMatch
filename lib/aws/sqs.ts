import "dotenv/config";
import { SQSClient } from "@aws-sdk/client-sqs";

const region = process.env.AWS_REGION || "ap-southeast-2";

export const sqsClient = new SQSClient({
    region,
    credentials: process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
})

export const SQS_QUEUE_URL = process.env.SQS_KEY_URL;
export const SQS_DLQ_URL = process.env.SQS_DLQ_KEY_URL;

if(!SQS_QUEUE_URL) {
    console.error("[SQS] Queue key not configured in the environment variables.")
}