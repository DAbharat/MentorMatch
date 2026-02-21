import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

export async function fetchAllSessions() {
    try {
        const response = await axios.get("/api/sessions")
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error fetching sessions:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while fetching sessions.")
    }
}

export async function confirmSession(sessionId: string) {
    try {
        const response = await axios.patch(`/api/sessions/${sessionId}`, { action: "CONFIRM" })
        console.log("responsedata: ", response.data)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error confirming session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while confirming session.")
    }
}

export async function cancelSession(sessionId: string) {
    try {
        const response = await axios.patch(`/api/sessions/${sessionId}`, { action: "CANCEL" })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error cancelling session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while cancelling session.")
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
        const response = await axios.post("/api/sessions", sessionData)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error creating session:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while creating session.")
    }
}

export async function checkMentorshipSessionStatus(mentorClerkId: string) {
    try {
        const allSessions = await fetchAllSessions()
        const sessions = allSessions.sessions || []
        
        const mentorshipSession = sessions.find((session: any) => 
            session.mentor.clerkUserId === mentorClerkId || 
            session.mentee.clerkUserId === mentorClerkId
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


