-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "menteeActiveminutes" INTEGER,
ADD COLUMN     "mentorActiveminutes" INTEGER,
ADD COLUMN     "metricsComputedAt" TIMESTAMP(3),
ADD COLUMN     "totalActiveMinutes" INTEGER;

-- CreateIndex
CREATE INDEX "Session_status_callStartedAt_idx" ON "Session"("status", "callStartedAt");
