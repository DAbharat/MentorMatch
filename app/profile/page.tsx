"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { Profile } from "@/types/profile";
import { fetchMyProfile } from "@/services/profile.service";
import { fetchFeedbacks } from "@/services/feedback.service";

const MAX_RETRIES = 5;
const RETRY_DELAYS = [500, 1000, 2000, 4000, 8000]; // ms

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#090a08] pt-8 sm:pt-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton className="w-20 h-20 rounded-full bg-[#161b12]" />
          <div className="flex-1 space-y-3 w-full">
            <Skeleton className="h-7 w-44 bg-[#1b2116]" />
            <Skeleton className="h-4 w-28 bg-[#161b12]" />
            <Skeleton className="h-4 w-full max-w-md bg-[#161b12]" />
          </div>
        </div>

        <div className="flex gap-8 border-b border-[#1e2419] pb-3">
          <Skeleton className="h-5 w-14 bg-[#161b12]" />
          <Skeleton className="h-5 w-14 bg-[#161b12]" />
          <Skeleton className="h-5 w-20 bg-[#161b12]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 bg-[#161b12]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg bg-[#161b12]" />
              <Skeleton className="h-8 w-24 rounded-lg bg-[#161b12]" />
              <Skeleton className="h-8 w-16 rounded-lg bg-[#161b12]" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 bg-[#161b12]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg bg-[#161b12]" />
              <Skeleton className="h-8 w-20 rounded-lg bg-[#161b12]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { userId, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const refreshProfile = useCallback(async () => {
    try {
      const fullProfile = await fetchMyProfile();
      if (fullProfile) {
        setProfile(fullProfile);
      }
    } catch (err) {
      console.error("ProfilePage: Error refreshing profile:", err);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      toast.error("You must be signed in to view your profile");
      router.replace("/sign-in");
    }
  }, [authLoading, userId, router]);

  useEffect(() => {
    if (authLoading || !userId) return;

    let cancelled = false;

    const fetchUserWithRetry = async (retryCount = 0) => {
      try {
        const fullProfile = await fetchMyProfile();
        if (cancelled) return;

        if (fullProfile) {
          setProfile(fullProfile);
          setLoading(false);
          setError(null);
          return;
        }

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            if (!cancelled) fetchUserWithRetry(retryCount + 1);
          }, RETRY_DELAYS[retryCount]);
        } else {
          setError(
            "Failed to load your profile. Please try again or sign up again."
          );
          setLoading(false);

          toast.error("Profile setup timeout. Redirecting to sign-up...");
          setTimeout(() => {
            router.replace("/sign-up");
          }, 3000);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "An error occurred while loading your profile.";

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            if (!cancelled) fetchUserWithRetry(retryCount + 1);
          }, RETRY_DELAYS[retryCount]);
        } else {
          setError(message);
          setLoading(false);

          toast.error(
            message || "An error occurred. Redirecting to sign-in..."
          );
          setTimeout(() => {
            router.replace("/sign-in");
          }, 3000);
        }
      }
    };

    fetchUserWithRetry();

    return () => {
      cancelled = true;
    };
  }, [authLoading, userId, router]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!profile) return;

      try {
        const data = await fetchFeedbacks(profile.id);
        setFeedbacks(data.fetchFeedback || []);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setFeedbacks([]);
      }
    };
    loadFeedbacks();
  }, [profile]);

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090a08] px-4">
        <div className="max-w-md w-full space-y-4">
          <div className="rounded-xl border border-[#61282d] bg-[#231214] p-4 flex items-start gap-2.5 text-left">
            <AlertCircle
              className="w-4 h-4 text-[#eb7b83] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm text-[#f4b8bc]">{error}</p>
          </div>
          <Button
            onClick={() => router.push("/sign-up")}
            className="w-full h-11 bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold rounded-xl cursor-pointer"
          >
            Back to sign up
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090a08] px-4">
        <p className="text-sm text-[#f4b8bc]">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a08] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8]">
      <ProfileHeader
        id={profile.id}
        name={profile.name}
        bio={profile.bio || ""}
        createdAt={profile.createdAt}
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        onProfileUpdated={refreshProfile}
      />
      <ProfileTabs
        stats={profile.stats}
        skillsOffered={profile.skillsOffered}
        skillsWanted={profile.skillsWanted}
        feedbacks={feedbacks}
        isOwner
      />
    </div>
  );
}
