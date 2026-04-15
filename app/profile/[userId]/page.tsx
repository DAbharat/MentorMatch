"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAUserProfile } from "@/services/profile.service";
import { fetchFeedbacks } from "@/services/feedback.service";

export default function PublicProfilePage() {
  const router = useRouter();
  const { userId: currentUserId } = useAuth();
  const params = useParams<{ userId: string }>()

  const userId = params.userId;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {

      try {
        const data = await fetchAUserProfile(userId)
        setProfile(data);
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
    if (currentUserId && currentUserId === userId) {
      router.replace("/profile");
    }
  }, [currentUserId, userId, router]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!profile) return;

      try {
        console.log("Loading feedbacks for user:", profile.id);
        const data = await fetchFeedbacks(profile.id);
        console.log("Feedbacks fetched:", data);
        setFeedbacks(data.fetchFeedback || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setFeedbacks([]);
      }
    }
    loadFeedbacks();
  }, [profile]);

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
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        hasAcceptedRequest={profile.hasAcceptedRequest}
        chatId={profile.chatId}
        hasActiveConfirmedSession={profile.hasActiveConfirmedSession}
      />

      <ProfileTabs
        stats={profile.stats}
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        feedbacks={feedbacks}
      />
    </div>
  );
}
