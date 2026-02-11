"use client"

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileFeedback from '@/components/profile/ProfileFeedback';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { redirect, useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';
import { fetchMyProfile } from '@/services/profile.service';


export default function ProfilePage() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            toast.error("You must be signed in to view your profile");
            router.replace("/sign-in");
        }
    }, [isLoaded, isSignedIn, router]);

    if (!profile) {
        return null;
    }

    useEffect(() => {
        console.log("loading profile")
        if (!isLoaded || !isSignedIn) return;

        const loadProfile = async () => {
            try {
                const data = await fetchMyProfile();
                console.log("profile fetched....")
                toast.success("Profile loaded successfully!");
                setProfile(data);
                setLoading(false);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                toast.error(axiosError.response?.data.message || "An error occurred while fetching profile.");
                router.replace("/sign-in");
            } finally {
                console.log("Profile fetch attempt finished.")
                setLoading(false);
            }
        }
        loadProfile();
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || loading) {
        return <Spinner />;
    }

    if (!profile) {
        return null;
    }

    return (
        <div>
            <div>
                <ProfileHeader
                    name={profile.name}
                    bio={profile.bio || ""}
                    createdAt={profile.createdAt}
                />
            </div>
            <div>
                <ProfileTabs
                    stats={profile.stats}
                    skillsOffered={profile.skillsOffered}
                    skillsWanted={profile.skillsWanted}
                    feedbacks={profile.feedbacks}
                />
            </div>
        </div>
    )
}
