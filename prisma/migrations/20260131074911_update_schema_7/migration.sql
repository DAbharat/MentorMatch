/*
  Warnings:

  - You are about to drop the column `menteeActiveminutes` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `mentorActiveminutes` on the `Session` table. All the data in the column will be lost.
  - The `completedBy` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SessionCompletedBy" AS ENUM ('Mentor', 'Auto');

-- DropIndex
DROP INDEX "Session_status_callStartedAt_idx";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "menteeActiveminutes",
DROP COLUMN "mentorActiveminutes",
ADD COLUMN     "menteeActiveMinutes" INTEGER,
ADD COLUMN     "mentorActiveMinutes" INTEGER,
DROP COLUMN "completedBy",
ADD COLUMN     "completedBy" "SessionCompletedBy";

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE INDEX "Session_status_callStartedAt_metricsComputedAt_idx" ON "Session"("status", "callStartedAt", "metricsComputedAt");
