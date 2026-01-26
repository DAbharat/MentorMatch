/*
  Warnings:

  - Made the column `sessionId` on table `UserFeedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserFeedback" DROP CONSTRAINT "UserFeedback_sessionId_fkey";

-- DropIndex
DROP INDEX "UserFeedback_mentorId_menteeId_key";

-- AlterTable
ALTER TABLE "MentorshipRequest" ALTER COLUMN "initialMessage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserFeedback" ALTER COLUMN "sessionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
