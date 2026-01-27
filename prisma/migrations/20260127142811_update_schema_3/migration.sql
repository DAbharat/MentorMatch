/*
  Warnings:

  - A unique constraint covering the columns `[mentorId,menteeId]` on the table `UserFeedback` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Mentor', 'Auto');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "completedBy" "Role" NOT NULL DEFAULT 'Mentor';

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_mentorId_menteeId_key" ON "UserFeedback"("mentorId", "menteeId");
