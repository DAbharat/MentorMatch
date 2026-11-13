import Redis from "ioredis";

declare global {
  var redisClient: Redis | undefined;
}

const createRedisClient = () => new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  connectTimeout: Number(process.env.REDIS_TIMEOUT) || 5000,
  retryStrategy(times) {
    const maxRetry = Number(process.env.REDIS_MAX_RETRY) || 5;

    if (times >= maxRetry) {
      console.error(`Redis connection failed after ${times} attempts.`);
      return null;
    }

    const delay = Math.min(times * 200, 2000);
    console.warn(`Redis connection failed. Retrying in ${delay}ms... (Attempt ${times}/${maxRetry})`);

    return delay;
  }
})

const redis = global.redisClient || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  global.redisClient = redis
}

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

let isShuttingDown = false;

async function shutDown(signal: string) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`Received ${signal}. Closing Redis...`)

  const forceExit = setTimeout(() => {
    console.error("Redis shutdown timeout. Force exiting...")
    process.exit(1);
  }, 5000)

  try {
    await redis.quit();
    clearTimeout(forceExit)
    console.log("Redis closed gracefully");
    process.exit(0);
  } catch (error: any) {
    clearTimeout(forceExit)
    console.error("Shutdown failed: ", error.message)
    process.exit(1)
  }
}

if (!process.listenerCount("SIGINT")) {
  process.on("SIGINT", () => shutDown("SIGINT"))
  process.on("SIGTERM", () => shutDown("SIGTERM"))
  process.on("beforeExit", () => shutDown("beforeExit"))
}

export async function healthCheck() {
  const start = Date.now();

  try {
    const response = await redis.ping();

    return {
      status: response === "PONG" ? "ok" : "error",
      latency: Date.now() - start
    }
  } catch (error: any) {
    return {
      status: "error",
      message: error.message
    }
  }
}

export default redis;