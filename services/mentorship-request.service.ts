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

export async function receivedMentorshipRequests(limit: number = 10, cursor?: string) {
    try {
        console.log("fetching received mentorship requests...")
        const params = new URLSearchParams({ limit: limit.toString() });

        if(cursor) params.append("cursor", cursor)

        const response = await axios.get(`/api/mentorship-requests/received?${params.toString()}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching received mentorship requests:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching received mentorship requests.");
    }
}

export async function updateMentorshipRequestStatus(
    requestId: string,
    status: "ACCEPT" | "REJECT"
) {
    try {
        console.log(`Updating mentorship request ${requestId} to ${status}...`)
        const response = await axios.patch(`/api/mentorship-requests/${requestId}`, { status })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error updating mentorship request:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while updating mentorship request.");
    }
}

export async function getMentorshipRequestById(requestId: string) {
    try {
        console.log("Fetching request by id...")
        const response = await axios.get(`/api/mentorship-requests/${requestId}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching mentorship request by id:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching mentorship request by id.");
    }
}
