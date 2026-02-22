"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        const res = await axios.get(`/api/user/${userId}`);
        setProfile(res.data.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "User not found");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, router]);

  useEffect(() => {
    if (user && user.id === userId) {
      router.replace("/profile");
    }
  }, [user, userId, router]);

  if (loading) return (
    <div className="flex items-center gap-4 p-6">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );

  if (!profile) return <p>User not found</p>;

  return (
    <div className='bg-[#0b090a]'>
      <ProfileHeader
        id={profile.id}
        name={profile.name}
        bio={profile.bio || ""}
        createdAt={profile.joinedAt}
        clerkUserId={profile.clerkUserId}
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        hasAcceptedRequest={profile.hasAcceptedRequest}
        chatId={profile.chatId}
        hasActiveConfirmedSession={profile.hasActiveConfirmedSession}
      />

      <ProfileTabs
        stats={{ averageRating: profile.averageRating, ratingCount: profile._count.sessionsAsMentor + profile._count.sessionsAsMentee, sessionsCompleted: profile.sessionsCompleted }}
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        feedbacks={profile.feedbacks}
      />
    </div>
  );
}
