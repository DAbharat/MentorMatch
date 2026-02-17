import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import React from 'react'

export async function FetchAllNotifications(params?: {
    filter?: "all" | "read" | "unread"
    cursor?: string
    limit?: number
}) {
    try {
        const query = new URLSearchParams()

        if(params?.filter) query.append("filter", params.filter)
        if(params?.cursor) query.append("cursor", params.cursor)
        if(params?.limit) query.append("limit", params.limit.toString())

        console.log("Fetching notifications with params:", params)
        const response = await axios.get(`/api/notifications?${query.toString()}`)
        console.log("Notifications response:", response.data)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching notifications:", {
            message: axiosError.response?.data.message || axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching notifications.");
    }
}
