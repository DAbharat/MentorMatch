/*
  Warnings:

  - The values [MENTORSHIP_REQUEST,REQUEST_ACCEPTED,REQUEST_REJECTED,REQUEST_SENT] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('MENTORSHIP_REQUEST_RECEIVED', 'MENTORSHIP_REQUEST_SENT', 'MENTORSHIP_REQUEST_ACCEPTED', 'MENTORSHIP_REQUEST_REJECTED', 'SESSION_SCHEDULED', 'SESSION_CANCELLED', 'SESSION_REMINDER', 'FEEDBACK_RECEIVED', 'FEEDBACK_SENT');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
