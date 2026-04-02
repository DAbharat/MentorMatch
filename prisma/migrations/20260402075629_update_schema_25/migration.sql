-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "mentorshipRequestId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
