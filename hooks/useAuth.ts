"use client"

import { useEffect, useState } from "react"
import axiosClient from "@/lib/axiosClient"

export function useAuth() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const verifySession = async () => {
            try {
                const response = await axiosClient.get("/api/user/profile")
                const user = response.data.data
                
                if (isMounted) {
                    if (user?.id) {
                        setUserId(user.id)
                    } else {
                        setUserId(null)
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setUserId(null)
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        verifySession()

        return () => {
            isMounted = false
        }
    }, [])

    return {
        userId,
        isLoading
    }
}