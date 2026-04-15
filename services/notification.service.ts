import axiosClient from '@/lib/axiosClient'
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
        const response = await axiosClient.get(`/api/notifications?${query.toString()}`)
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

export async function deleteAllNotifications() {
    try {
        console.log("deleting notifications...")
        const response = await axiosClient.delete(`/api/notifications`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error deleting notifications:", {
            message: axiosError.response?.data.message || axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
        throw new Error(axiosError.response?.data.message || "An error occurred while deleting notifications.");
    }
}

export async function deleteNotificationById(notificationId: string) {
    try {
        console.log("deleting single notification...")
        const response = await axiosClient.delete(`/api/notifications/${notificationId}`)
        return response.data 
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error deleting notification:", {
            message: axiosError.response?.data.message || axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
        throw new Error(axiosError.response?.data.message || "An error occurred while deleting the notification.");
    }
}

export async function markAllNotificationsAsRead() {
    try {
        console.log("marking all as read...")
        const response = await axiosClient.patch(`/api/notifications/read-all`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error marking notifications as read:", {
            message: axiosError.response?.data.message || axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
        throw new Error(axiosError.response?.data.message || "An error occurred while marking notifications as read.");
    }
}

export async function markSingleNotificationAsRead(notificationId: string) {
    try {
        console.log("marking one noti as read...", notificationId)
        const response = await axiosClient.patch(`/api/notifications/${notificationId}/read`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error marking notification as read:", {
            message: axiosError.response?.data.message || axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data
        });
        throw new Error(axiosError.response?.data.message || "An error occurred while marking the notification as read.");
    }
}