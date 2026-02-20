"use client"
import React, { useState } from 'react'
import { DM_Sans } from 'next/font/google';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { profile } from 'console';
import RequestFormContainer from '../mentorship-request/RequestFormContainer';
import { MessageSquare } from 'lucide-react';


const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type Skills = {
  id: string;
  name: string;
}

type ProfileHeaderProps = {
  id: string;
  name: string;
  bio: string;
  createdAt: string;
  clerkUserId: string;
  skillsOffered: Skills[];
  hasAcceptedRequest?: boolean;
  chatId?: string;
}

function getMemberSince(createdAt: string) {
  return new Date(createdAt).getFullYear();
}

export default function ProfileHeader(
  { id, name, bio, createdAt, clerkUserId, skillsOffered, hasAcceptedRequest = false, chatId }: ProfileHeaderProps
) {
  const memberSince = getMemberSince(createdAt);
  const router = useRouter()
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  if (!user) {
    return null;
  }
  // console.log("Clerk ID:", user?.id)
  // console.log("Profile clerkUserId:", clerkUserId)

  const isOwner = user.id === clerkUserId

  return (
    <div className={`bg-linear-to-br ${DM_Sans_Font.className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <header className="pt-16 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* LEFT: Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-xl font-semibold shadow-md">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* RIGHT: Info + Button */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-semibold">{name}</h1>

              <p className="text-muted-foreground mt-1">{bio}</p>

              <p className="text-muted-foreground text-sm mt-1">
                Member since {memberSince}
              </p>

              {/* Button exactly below "Member since" */}
              {isOwner ? (
                <Button
                  size="sm"
                  className="mt-6 bg-transparent border border-black border-b-2 text-black px-4"
                  onClick={() => router.push("/profile/edit")}
                >
                  Edit Profile
                </Button>
              ) : hasAcceptedRequest && chatId ? (
                <div className="flex gap-2 mt-6">
                  <Button
                    size="sm"
                    className="bg-transparent border border-black border-b-2 text-black px-4 flex items-center gap-2"
                    onClick={() => router.push(`/chats/${chatId}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    className="bg-transparent border border-black border-b-2 text-black px-4"
                    onClick={() => setOpen(true)}
                  >
                    Send Request
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="mt-6 bg-transparent border border-black border-b-2 text-black px-4"
                  onClick={() => setOpen(true)}
                >
                  Send Request
                </Button>
              )}
            </div>
            {open && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <RequestFormContainer
                    mentorId={id}
                    mentorName={name}
                    skills={skillsOffered}
                    onClose={() => setOpen(false)}
                  />
                </div>
              </div>
            )}
            <UserButton />

          </div>
        </header>
      </div>
    </div>
  );
}
