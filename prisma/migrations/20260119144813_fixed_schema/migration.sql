/*
  Warnings:

  - You are about to drop the `SessionFeedback` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "SessionFeedback" DROP CONSTRAINT "SessionFeedback_givenById_fkey";

-- DropForeignKey
ALTER TABLE "SessionFeedback" DROP CONSTRAINT "SessionFeedback_sessionId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "SessionFeedback";

-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "sessionId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "confidenceBefore" INTEGER,
    "confidenceAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_sessionId_key" ON "UserFeedback"("sessionId");

-- CreateIndex
CREATE INDEX "UserFeedback_mentorId_idx" ON "UserFeedback"("mentorId");

-- CreateIndex
CREATE INDEX "UserFeedback_menteeId_idx" ON "UserFeedback"("menteeId");

-- CreateIndex
CREATE INDEX "UserFeedback_sessionId_idx" ON "UserFeedback"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_mentorId_menteeId_key" ON "UserFeedback"("mentorId", "menteeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
