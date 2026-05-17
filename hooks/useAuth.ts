"use client"

import { useEffect, useState } from "react"
import axiosClient from "@/lib/axiosClient"

export function useAuth() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("userId")
            
            if(stored) setUserId(stored)

            const verifySession = async () => {
                try {
                    const response = await axiosClient.get("/api/user/profile")
                    const user = response.data.data
                    
                    if (user?.id) {
                        setUserId(user.id)
                        localStorage.setItem("userId", user.id)
                    } else {
                        setUserId(null)
                        localStorage.removeItem("userId")
                    }
                } catch (error) {
                    setUserId(null)
                    localStorage.removeItem("userId")
                } finally {
                    setIsLoading(false)
                }
            }

            verifySession()
        }
    }, [])

    return {
        userId,
        isLoading
    }
}