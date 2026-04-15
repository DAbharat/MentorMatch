import axiosClient from "@/lib/axiosClient"
import { ApiResponse } from "@/types/ApiResponse"
import { WebRTCConfig } from "@/types/WebRTCConfig"
import axios, { AxiosError } from "axios"

export async function startVideoCall(sessionId: string): Promise<WebRTCConfig> {
    if(!sessionId) {
        throw new Error("Session ID is required to start a video call.")
    }
    
    try {
        const response = await axiosClient.get<WebRTCConfig>(`/api/sessions/${sessionId}/webrtc/config`)
        return response.data
    } catch (error:any) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error starting video call:", axiosError.response?.data || axiosError.message)
        throw new Error(error.message || "Failed to start video call")
    }
}