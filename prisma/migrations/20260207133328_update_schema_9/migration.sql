/*
  Warnings:

  - Made the column `comment` on table `UserFeedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserFeedback" ALTER COLUMN "comment" SET NOT NULL;
