import { logToCloudWatch } from "@/lib/aws/cloudwatch"
import { startSQSWorker, stopSQSWorker } from "./sqs.worker"

async function bootstrap() {
    console.log("==========================================")
    console.log("[Worker Process] Bootstrapping SQS Worker...")
    console.log("==========================================")

    const shutdown = async (signal: string) => {
        console.log(`\n[Worker Process] Received ${signal}. Shutting down worker gracefully...`)
        await logToCloudWatch(`[Worker Process] Received ${signal}. Worker shutting down.`, "WARN")

        stopSQSWorker();

        setTimeout(() => {
            console.log("[Worker Process] Shutdown complete. GoodBye!")
            process.exit(0)
        }, 3000)
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    await startSQSWorker();
}

bootstrap().catch(async(error) => {
    console.error("[Worker Process] Fatal error starting worker: ", error)
    await logToCloudWatch("[Worker Process] Fatal startup error", "ERROR", {
        error: error.message,
        stack: error.stack
    })
    process.exit(1);
})
