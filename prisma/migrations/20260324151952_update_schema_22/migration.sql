/*
  Warnings:

  - A unique constraint covering the columns `[normalizedSkillName]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - Made the column `normalizedSkillName` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "normalizedSkillName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Skill_normalizedSkillName_key" ON "Skill"("normalizedSkillName");
