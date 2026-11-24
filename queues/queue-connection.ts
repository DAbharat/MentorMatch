import { ConnectionOptions } from "bullmq";
import 'dotenv/config';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL environment missing for queues.")
}

const parsedURL = new URL(redisUrl)

export const queueRedisConnection: ConnectionOptions = {
    host: parsedURL.hostname,
    port: Number(parsedURL.port) || 6379,
    username: parsedURL.username || "default",
    password: parsedURL.password || undefined,
    tls: parsedURL.protocol === "rediss:" ? {
        rejectUnauthorized: false
    } : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
}