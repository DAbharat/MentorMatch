"use client"

import { useEffect, useState, useCallback } from "react"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { fetchAllMessage } from "@/services/messages.service"

type Message = {
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: string
    isDelivered: boolean
    isRead: boolean
    readAt: string | null
    sender: {
        id: string
        name: string
        clerkUserId: string
    }
}

type MessagesResponse = {
    data: Message[]
    pagination: {
        nextCursor: string | null
        limit: number
    }
}

export function useChatMessages(chatId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const fetchMessages = async (cursor?: string) => {
        try {
            const result = await fetchAllMessage(chatId, 20, cursor)
            return result as MessagesResponse
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            throw new Error(
                axiosError.response?.data.message || "Failed to fetch messages"
            )
        }
    }


    useEffect(() => {
        let mounted = true

        if (!chatId) {
            setIsLoading(false)
            return
        }

        setMessages([])
        setNextCursor(null)
        setIsLoading(true)

            ; (async () => {
                try {
                    const result = await fetchMessages()
                    if (!mounted) return

                    setMessages(result.data.reverse())
                    setNextCursor(result.pagination.nextCursor)
                } catch (err) {
                    console.error(err)
                } finally {
                    mounted && setIsLoading(false)
                }
            })()

        return () => {
            mounted = false
        }
    }, [chatId])

    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) return

        try {
            setIsLoadingMore(true)
            const result = await fetchMessages(nextCursor)

            setMessages(prev => [
                ...result.data.reverse(),
                ...prev,
            ])

            setNextCursor(result.pagination.nextCursor)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingMore(false)
        }
    }, [nextCursor, isLoadingMore])

    const appendMessage = useCallback((message: Message) => {
        setMessages(prev =>
            prev.some(m => m.id === message.id) ? prev : [...prev, message]
        )
    }, [])

    return {
        messages,
        isLoading,
        isLoadingMore,
        hasMore: Boolean(nextCursor),
        loadMore,
        appendMessage,
    }
}
