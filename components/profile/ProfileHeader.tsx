"use client"
import React from 'react'
import { DM_Sans } from 'next/font/google';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';


const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type ProfileHeaderProps = {
    name: string;
    bio: string;
    createdAt: string;
}

function getMemberSince(createdAt: string) {
  return new Date(createdAt).getFullYear();
}

export default function ProfileHeader(
    { name, bio, createdAt }: ProfileHeaderProps
) {
    const memberSince = getMemberSince(createdAt);
    const router = useRouter()

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
              <Button
                size="sm"
                className="mt-6 bg-transparent border border-black border-b-2 text-black px-4"
                onClick={() => { router.push("/profile/edit")}}
              >
                Edit Profile
              </Button>
            </div>

          </div>
        </header>
      </div>
    </div>
  );
}
