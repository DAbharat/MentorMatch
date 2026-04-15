import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import axiosClient from "@/lib/axiosClient";

export async function fetchAllSessions() {
    try {
        const response = await axiosClient.get("/api/sessions")
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching sessions:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching sessions.")
    }
}

export async function fetchSessionById(sessionId: string) {
    try {
        const response = await axiosClient.get(`/api/sessions/${sessionId}`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching session.")
    }
}

export async function confirmSession(sessionId: string) {
    try {
        const response = await axiosClient.patch(`/api/sessions/${sessionId}`, { action: "CONFIRM" })
        console.log("responsedata: ", response.data)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error confirming session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while confirming session.")
    }
}

export async function startSession(sessionId: string) {
    try {
        const response = await axiosClient.patch(`/api/sessions/${sessionId}`, { action: "START"})
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error starting session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while starting session.")
    }
}

export async function cancelSession(sessionId: string) {
    try {
        const response = await axiosClient.patch(`/api/sessions/${sessionId}`, { action: "CANCEL" })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error cancelling session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while cancelling session.")
    }
}

export async function completeSession(sessionId: string, isAutoEnd = false) {
    try {
        const response = await axiosClient.patch(`/api/sessions/${sessionId}`, { action: "COMPLETE", isAutoEnd })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error completing session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while completing session.")
    }
}

export async function createSession(sessionData: {
    mentorId: string
    menteeId: string
    skillId: string
    scheduledAt: string
    totalCallDuration: number
}) {
    try {
        console.log("session data: ", sessionData)
        const response = await axiosClient.post("/api/sessions", sessionData)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error creating session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while creating session.")
    }
}

export async function checkMentorshipSessionStatus(mentorId: string) {
    try {
        const allSessions = await fetchAllSessions()
        const sessions = allSessions.sessions || []
        
        const mentorshipSession = sessions.find((session: any) => 
            session.mentor.id === mentorId || 
            session.mentee.id === mentorId
        )
        
        if (!mentorshipSession) {
            return { hasSession: false, status: null }
        }
        
        return { 
            hasSession: true, 
            status: mentorshipSession.status,
            sessionId: mentorshipSession.id 
        }
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error checking session status:", axiosError.response?.data.message || axiosError.message)
        return { hasSession: false, status: null }
    }
}

export async function cleanupStuckSessions() {
    try {
        const response = await axiosClient.post("/api/sessions/cleanup-stuck")
        console.log("Cleanup response:", response.data)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error response:", axiosError.response?.data)
        console.error("Error status:", axiosError.response?.status)
        console.error("Error message:", axiosError.message)
        throw new Error(axiosError.response?.data?.message || "An error occurred while cleaning up stuck sessions.")
    }
}


