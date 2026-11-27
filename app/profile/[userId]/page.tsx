"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAUserProfile } from "@/services/profile.service";
import { fetchFeedbacks } from "@/services/feedback.service";
import type { Profile } from "@/types/profile";

type PublicProfile = {
  id: string;
  name: string;
  bio?: string | null;
  joinedAt: string;
  skillsOffered: Profile["skillsOffered"];
  skillsWanted: Profile["skillsWanted"];
  stats: Profile["stats"];
  hasAcceptedRequest?: boolean;
  chatId?: string;
  hasActiveConfirmedSession?: boolean;
};

export default function PublicProfilePage() {
  const router = useRouter();
  const { userId: currentUserId } = useAuth();
  const params = useParams<{ userId: string }>();

  const userId = params.userId;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        const data = await fetchAUserProfile(userId);
        setProfile(data);
      } catch (error: unknown) {
        const errMsg =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "User not found";
        toast.error(errMsg);
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
        const data = await fetchFeedbacks(profile.id);
        setFeedbacks(data.fetchFeedback || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setFeedbacks([]);
      }
    };
    loadFeedbacks();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a08] pt-8 sm:pt-12">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full bg-[#161b12]" />
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-7 w-44 bg-[#1b2116]" />
              <Skeleton className="h-4 w-64 bg-[#161b12]" />
            </div>
          </div>
          <div className="flex gap-8 border-b border-[#1e2419] pb-3">
            <Skeleton className="h-5 w-14 bg-[#161b12]" />
            <Skeleton className="h-5 w-14 bg-[#161b12]" />
            <Skeleton className="h-5 w-20 bg-[#161b12]" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#090a08] flex items-center justify-center px-4">
        <p className="text-sm text-[#f4b8bc]">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a08] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8]">
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
