import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios'
import React from 'react'

export async function MentorshipRequestService(requestData: {
    mentorId: string;
    initialMessage: string;
    skillId: string;
}) {
    try {
        console.log("fetching request api...")
        const response = await axios.post(`/api/users/${requestData.mentorId}/mentorship-request`, requestData)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error sending mentorship request:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while sending mentorship request.");
    }
}

