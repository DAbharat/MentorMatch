import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import axiosClient from "@/lib/axiosClient";

export async function fetchAllMessage(chatId: string, limit: number = 20, cursor?: string) {
    try {
        console.log("fetching messages...")
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append("cursor", cursor);

        const response = await axiosClient.get(`/api/chats/${chatId}/messages?${params.toString()}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching messages:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching messages.")
    }
}

export async function sendMessage(chatId: string, content: string) {
    try {
        console.log("sending message...", content)
        const response = await axiosClient.post(`/api/chats/${chatId}/messages`, { content })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error sending message:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while sending the message.")
    }
}

export async function fetchAllChatsForAUser() {
    try {
        console.log("fetching all chats...")
        const response = await axiosClient.get(`/api/chats`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching chats for user:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching chats for the user.")
    }
}

export async function markChatMessagesAsRead(chatId: string) {
    try {
        const response = await axiosClient.patch(`/api/chats/${chatId}/messages/read`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error marking messages as read:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while marking messages as read.")
    }
}