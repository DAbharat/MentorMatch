import axiosClient from "@/lib/axiosClient";
import { RecommendationsResponse } from "@/types/recommendation";
import { AxiosError } from "axios";

export async function fetchRecommendations(limit: number = 10): Promise<RecommendationsResponse> {
    try {
        const response = await axiosClient.get<RecommendationsResponse>(`/api/mentors/recommendations?limit=${limit}`);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Error fetching recommendations:", axiosError.response?.data?.message || axiosError.message);
        throw new Error(axiosError.response?.data?.message || "Failed to fetch mentor recommendations.");
    }
}

