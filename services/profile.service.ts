import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import axiosClient from "@/lib/axiosClient";

export async function fetchMyProfile() {
    try {
        console.log("fetching profile from backend....")
        const response = await axiosClient.get(`/api/user/profile`);
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching profile:", axiosError.response?.data.message || error);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching profile.");
    }
}

export async function updateMyProfile(profileData: {
    name?: string;
    bio?: string;
    skillsOffered?: string[];
    skillsWanted?: string[];
}) {
    try {
        console.log("Updating profile with data...");
        const response = await axiosClient.patch(`/api/user/profile`, profileData);
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error updating profile:", axiosError.response?.data.message || error);
        throw new Error(axiosError.response?.data.message || "An error occurred while updating profile.");
    }
}

export async function fetchUserById(params: { userId: string }) {
    try {
        //console.log("userid: ", params.clerkUserId)
        const response = await axiosClient.get(`/api/user/${params.userId}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching user:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching user.")
    }
}

export async function fetchAUserProfile(userId: string) {
    try {
        console.log("fetching another user's profile...")
        const response = await axiosClient.get(`/api/user/${userId}`)
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching user profile:", axiosError.response?.data.message || error);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching user profile.");
    }
}