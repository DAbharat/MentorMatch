/*
  Warnings:

  - A unique constraint covering the columns `[mentorId,menteeId,skillId]` on the table `MentorshipRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `skillId` to the `MentorshipRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MentorshipRequest_mentorId_menteeId_key";

-- AlterTable
ALTER TABLE "MentorshipRequest" ADD COLUMN     "skillId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MentorshipRequest_skillId_idx" ON "MentorshipRequest"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipRequest_mentorId_menteeId_skillId_key" ON "MentorshipRequest"("mentorId", "menteeId", "skillId");

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
