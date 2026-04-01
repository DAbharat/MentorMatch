-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "mentorshipRequestId" TEXT;

-- CreateIndex
CREATE INDEX "Session_mentorshipRequestId_idx" ON "Session"("mentorshipRequestId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
