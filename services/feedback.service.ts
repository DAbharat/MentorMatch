import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";

export async function createFeedback(feedbackData: {
    mentorId: string;
    sessionId: string;
    rating: number;
    comment: string;
}) {
    try {
        const response = await axiosClient.post(`/api/users/${feedbackData.mentorId}/feedback`, feedbackData)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error creating feedback:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while creating feedback.")
    }
}

export async function fetchFeedbacks(mentorId: string) {
    try {
        const response = await axiosClient.get(`/api/users/${mentorId}/feedback`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching feedbacks:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching feedbacks.")
    }
}