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