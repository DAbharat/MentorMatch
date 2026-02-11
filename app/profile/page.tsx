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
        if (!isLoaded) {
            console.log("ProfilePage: User data not loaded yet.");
            return;
        }

        if (!isSignedIn) {
            console.log("ProfilePage: User not signed in. Redirecting to /sign-in.");
            toast.error("You must be signed in to view your profile");
            router.replace("/sign-in");
        } else {
            console.log("ProfilePage: User is signed in.", user);
        }
    }, [isLoaded, isSignedIn, router, user]);

    useEffect(() => {
        console.log("ProfilePage: Attempting to load profile.");
        if (!isLoaded || !isSignedIn) return;

        const loadProfile = async () => {
            try {
                const data = await fetchMyProfile();
                console.log("ProfilePage: Profile fetched successfully.", data);
                toast.success("Profile loaded successfully!");
                setProfile(data);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                console.error("ProfilePage: Error fetching profile.", axiosError.response?.data.message || error);
                toast.error(axiosError.response?.data.message || "An error occurred while fetching profile.");
                router.replace("/sign-in");
            } finally {
                console.log("ProfilePage: Profile fetch attempt finished.");
                setLoading(false);
            }
        };
        loadProfile();
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || loading) {
        console.log("ProfilePage: Loading spinner displayed.");
        return <Spinner />;
    }

    if (!profile) {
        console.error("ProfilePage: Profile not found.");
        toast.error("Profile not found.");
        return <p className="text-center text-red-500">Profile not found.</p>;
    }

    console.log("ProfilePage: Rendering profile page.", profile);

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
    );
}
