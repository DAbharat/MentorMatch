import axiosClient from "@/lib/axiosClient";
import { MentorAnalyticsResponse } from "@/types/analytics";
import { AxiosError } from "axios";

export async function fetchMentorAnalytics(): Promise<MentorAnalyticsResponse> {
    try {
        const response = await axiosClient.get<MentorAnalyticsResponse>("/api/mentors/analytics");
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Error fetching mentor analytics:", axiosError.response?.data?.message || axiosError.message);
        throw new Error(axiosError.response?.data?.message || "Failed to load mentor analytics.");
    }
}

