"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { fetchMyProfile, updateMyProfile } from "@/services/profile.service";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Profile } from "@/types/profile";
import { DM_Sans } from "next/font/google";
import { Button } from "@/components/retroui/Button";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

export default function EditProfilePage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        skillsOffered: "",
        skillsWanted: "",
    });

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            toast.error("You must be signed in to edit your profile");
            router.replace("/sign-in");
        } else {
            const loadProfile = async () => {
                try {
                    const data = await fetchMyProfile();
                    setProfile(data);
                    setFormData({
                        name: data.name || "",
                        bio: data.bio || "",
                        skillsOffered: data.skillsOffered?.join(", ") || "",
                        skillsWanted: data.skillsWanted?.join(", ") || "",
                    });
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    toast.error(
                        axiosError.response?.data.message ||
                        "An error occurred while fetching profile."
                    );
                } finally {
                    setLoading(false);
                }
            };
            loadProfile();
        }
    }, [isLoaded, isSignedIn, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMyProfile({
                name: formData.name,
                bio: formData.bio,

                skillsOffered: formData.skillsOffered
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),
                
                skillsWanted: formData.skillsWanted
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),
            });
            toast.success("Profile updated successfully!");
            router.push("/profile");
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(
                axiosError.response?.data.message || "An error occurred while updating profile."
            );
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-5 ${DM_Sans_Font.className}`}>
            <div className="w-full max-w-6xl bg-white lg:bg-transparent rounded-2xl sm:rounded-3xl lg:rounded-none shadow-xl sm:shadow-2xl lg:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                {/* Left: Form */}
                <div className="p-6 sm:p-7 md:p-9 lg:p-11">
                    <div className="max-w-md mx-auto">

                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                Edit Profile
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 font-light">
                                Update your personal information and skills
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="text-sm text-gray-700 font-semibold mb-1 block">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm text-gray-700 font-semibold mb-1 block">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell others about yourself..."
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                                />
                            </div>

                            {/* Skills Offered */}
                            <div>
                                <label className="text-sm text-gray-700 font-semibold mb-1 block">
                                    Skills Offered
                                </label>
                                <input
                                    type="text"
                                    name="skillsOffered"
                                    value={formData.skillsOffered}
                                    onChange={handleInputChange}
                                    placeholder="React, Node.js, PostgreSQL"
                                    className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Separate skills with commas
                                </p>
                            </div>

                            {/* Skills Wanted */}
                            <div>
                                <label className="text-sm text-gray-700 font-semibold mb-1 block">
                                    Skills Wanted
                                </label>
                                <input
                                    type="text"
                                    name="skillsWanted"
                                    value={formData.skillsWanted}
                                    onChange={handleInputChange}
                                    placeholder="System Design, DevOps"
                                    className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Separate skills with commas
                                </p>
                            </div>

                            {/* Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-8"
                            >
                                Save Changes
                            </Button>

                        </form>
                    </div>
                </div>

                {/* Right: Visual Panel */}
                <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white p-8 xl:p-10 relative overflow-hidden rounded-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-md text-center relative z-10">
                        <h2 className="text-2xl font-bold mb-3 leading-tight">
                            Keep Your Profile Updated
                        </h2>
                        <p className="text-sm mb-6 text-indigo-100 font-light">
                            The better your profile, the better your mentor matches.
                        </p>

                        <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl">
                            <p className="text-sm text-white/90 font-medium">
                                Showcase your strengths and find the right learning partners.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );



}