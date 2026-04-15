"use client"

import { useEffect, useState } from "react"

export function useAuth() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if(typeof window !== "undefined") {
            const stored = localStorage.getItem("userId")
            setUserId(stored)
            setIsLoading(false)
        }
    }, [])

    return {
        userId,
        isLoading
    }
}