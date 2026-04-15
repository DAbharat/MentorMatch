import axiosClient from '@/lib/axiosClient';
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
        const response = await axiosClient.post(`/api/users/${requestData.mentorId}/mentorship-request`, requestData)
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

        const response = await axiosClient.get(`/api/mentorship-requests/received?${params.toString()}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching received mentorship requests:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching received mentorship requests.");
    }
}

export async function sentMentorshipRequests(status?: string, limit: number = 10, cursor?: string) {
    try {
        console.log("fetching sent mentorship requests...")
        const params = new URLSearchParams({ limit: limit.toString() });

        if(cursor) params.append("cursor", cursor)
        if(status) params.append("status", status)

        const response = await axiosClient.get(`/api/mentorship-requests/sent?${params.toString()}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching sent mentorship requests:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching sent mentorship requests.");
    }
}

export async function updateMentorshipRequestStatus(
    requestId: string,
    status: "ACCEPT" | "REJECT"
) {
    try {
        console.log(`Updating mentorship request ${requestId} to ${status}...`)
        const response = await axiosClient.patch(`/api/mentorship-requests/${requestId}`, { status })
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
        const response = await axiosClient.get(`/api/mentorship-requests/${requestId}`)
        //console.log("request response: ", response)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching mentorship request by id:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching mentorship request by id.");
    }
}

export async function getMentorshipRequestsByUsers(
    mentorId: string,
    menteeId: string,
    status?: string
) {
    try {
        console.log("Fetching mentorship requests by users...")
        const params = new URLSearchParams({ mentorId, menteeId });
        if (status) params.append("status", status);
        
        const response = await axiosClient.get(`/api/mentorship-requests?${params.toString()}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error fetching mentorship requests by users:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching mentorship requests by users.");
    }
}
