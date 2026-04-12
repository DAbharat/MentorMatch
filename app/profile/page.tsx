"use client"

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/retroui/Button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileFeedback from '@/components/profile/ProfileFeedback';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { redirect, useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';
import { fetchMyProfile } from '@/services/profile.service';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchFeedbacks } from '@/services/feedback.service';


const MAX_RETRIES = 5
const RETRY_DELAYS = [500, 1000, 2000, 4000, 8000] // ms

export default function ProfilePage() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        if (!isLoaded) {
            console.log("ProfilePage: User data not loaded yet.");
            return;
        }

        if (!isSignedIn) {
            console.log("ProfilePage: User not signed in. Redirecting to /sign-in.");
            toast.error("You must be signed in to view your profile");
            router.replace("/sign-in");
        } else {
            console.log("ProfilePage: User is signed in.");
        }
    }, [isLoaded, isSignedIn, router, user]);

    useEffect(() => {
        console.log("ProfilePage: Attempting to load profile.");
        if (!isLoaded || !isSignedIn) return;

        const fetchUserWithRetry = async (retryCount = 0) => {
            try {
                const fullProfile = await fetchMyProfile();

                if (fullProfile) {
                    console.log("ProfilePage: Profile loaded successfully.", fullProfile);
                    setProfile(fullProfile);
                    setLoading(false);
                    setError(null);
                    return;
                }

                if (retryCount < MAX_RETRIES) {
                    console.log(`ProfilePage: Profile not found. Retry ${retryCount + 1}/${MAX_RETRIES} after ${RETRY_DELAYS[retryCount]}ms`);
                    setTimeout(() => {
                        fetchUserWithRetry(retryCount + 1);
                    }, RETRY_DELAYS[retryCount]);

                } else {
                    console.error("ProfilePage: Max retries exceeded. Profile not found in database.");

                    setError("Failed to load your profile. The webhook may not have processed your account yet. Please try again or sign up again.");
                    setLoading(false);

                    toast.error("Profile setup timeout. Redirecting to sign-up...");
                    setTimeout(() => {
                        router.replace("/sign-up");
                    }, 3000);
                }
            } catch (err: any) {
                console.error("ProfilePage: Error fetching profile (attempt " + (retryCount + 1) + "):", err.message);
                
                if (retryCount < MAX_RETRIES) {
                    console.log(`ProfilePage: Retrying after ${RETRY_DELAYS[retryCount]}ms...`);
                    setTimeout(() => {
                        fetchUserWithRetry(retryCount + 1);
                    }, RETRY_DELAYS[retryCount]);
                    
                } else {
                    setError(err.message || "An error occurred while loading your profile.");
                    setLoading(false);

                    toast.error(err.message || "An error occurred. Redirecting to sign-in...");
                    setTimeout(() => {
                        router.replace("/sign-in");
                    }, 3000);
                }
            }
        };

        fetchUserWithRetry();
    }, [isLoaded, isSignedIn, router]);

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
        }
        loadFeedbacks();
    }, [profile])

    if (!isLoaded || loading) {
        console.log("ProfilePage: Loading skeleton displayed.");
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0b090a]">
                <div className="flex flex-col items-center gap-4 p-6">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 text-center">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <p className="text-sm text-gray-400 mt-4">Setting up your account...</p>
                </div>
            </div>
        )
    }

    if (error) {
        console.error("ProfilePage: Error occurred:", error);
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0b090a]">
                <div className="max-w-md w-full p-6 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button
                        onClick={() => router.push("/sign-up")}
                        className="w-full bg-[#d3d3d3] hover:bg-[#bcbcbc] text-black font-semibold rounded-full"
                    >
                        Back to Sign Up
                    </Button>
                </div>
            </div>
        );
    }

    if (!profile) {
        console.error("ProfilePage: Profile is null.");
        toast.error("Profile not found.");
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0b090a]">
                <p className="text-center text-red-500">Profile not found.</p>
            </div>
        );
    }

    // console.log("ProfilePage: Rendering profile page.", profile);

    return (
        <div className='bg-[#0b090a]'>
            <div>
                <ProfileHeader
                    id={profile.id}
                    name={profile.name}
                    bio={profile.bio || ""}
                    createdAt={profile.createdAt}
                    clerkUserId={profile.clerkUserId}
                    skillsOffered={profile.skillsOffered}
                    skillsWanted={profile.skillsWanted}
                />
            </div>
            <div>
                <ProfileTabs
                    stats={profile.stats}
                    skillsOffered={profile.skillsOffered}
                    skillsWanted={profile.skillsWanted}
                    feedbacks={feedbacks}
                />
            </div>
        </div>
    );
}
