import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    connectTimeout: Number(process.env.REDIS_TIMEOUT) || 5000,
    retryStrategy(times) {
        const maxRetry = Number(process.env.REDIS_MAX_RETRY) || 5;

        if(times >= maxRetry) {
            console.error(`Redis connection failed after ${times} attempts.`);
            return null; 
        }

        const delay = Math.min(times * 200, 2000);
        console.warn(`Redis connection failed. Retrying in ${delay}ms... (Attempt ${times}/${maxRetry})`);

        return delay;
    }
})

redis.on("connect", () => {
    console.log("Connected to Redis successfully.");
})

redis.on("ready", () => {
  console.log("Redis connection is ready to use.");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redis;