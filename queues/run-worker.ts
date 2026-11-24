import { setupRecurringAutoCompleteJob } from "./session.queue"
import { createSessionWorker } from "./session.worker"

async function bootstrap() {
    console.log("[Worker Process] Initializing Session Worker...")

    const worker = createSessionWorker()

    try {
        await setupRecurringAutoCompleteJob()
        console.log("[Worker Process] Auto-complete recurring job scheduler registered.")
    } catch (error) {
        console.error("[Worker Process] Failed to register recurring job scheduler: ", error)
    }

    const shutdown = async (signal: string) => {
        console.log(`\n [Worker Process] Received ${signal}. Gracefullt shutting down worker...`)
        try {
            await worker.close()
            console.log("[Worker Process] Worker closed successfully. Exiting.")
            process.exit(0)
        } catch (error) {
            console.error("[Worker Process] Error during worker shutdown: ", error)
            process.exit(1)
        }
    }

    process.on("SIGINT", () => shutdown("SIGINT"))
    process.on("SIGTERM", () => shutdown("SIGTERM"))

    console.log("[Worker process] Worker is actively listening for jobs.")
}

bootstrap().catch((error) => {
    console.error("[Worker Process] Fatal error starting worker: ", error)
    process.exit(1)
})
