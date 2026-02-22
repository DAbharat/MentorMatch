import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

export async function fetchMyProfile() {
    try {
        console.log("fetching profile from backend....")
        const response = await axios.get(`/api/user/profile`);
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
        console.log("Updating profile with data:", profileData);
        const response = await axios.patch(`/api/user/profile`, profileData);
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error updating profile:", axiosError.response?.data.message || error);
        throw new Error(axiosError.response?.data.message || "An error occurred while updating profile.");
    }
}

export async function fetchUserById(params: { clerkUserId: string }) {
    try {
        //console.log("userid: ", params.clerkUserId)
        const response = await axios.get(`/api/user/${params.clerkUserId}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching user:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching user.")
    }
}
