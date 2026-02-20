/*
  Warnings:

  - A unique constraint covering the columns `[mentorId,menteeId,skillId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `skillId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chat_mentorId_menteeId_key";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "skillId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_mentorId_menteeId_skillId_key" ON "Chat"("mentorId", "menteeId", "skillId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
