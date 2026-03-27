/*
  Warnings:

  - Added the required column `skillId` to the `UserFeedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserFeedback" ADD COLUMN     "skillId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
