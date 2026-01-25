"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@clerk/nextjs"

type SocketMessage = {
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: string
}

type TypingUser = {
    userId: string
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"

type UseChatSocketProps = {
    chatId: string | null
    onNewMessage: (message: SocketMessage) => void
}

export function useChatSocket({
    chatId,
    onNewMessage,
}: UseChatSocketProps) {
    const { getToken, userId } = useAuth()

    const socketRef = useRef<Socket | null>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [connected, setConnected] = useState(false)
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const [isConnecting, setIsConnecting] = useState(false)
    const [socketError, setSocketError] = useState<string | null>(null)


    useEffect(() => {
        if (!chatId || !userId) return

        let active = true

        const connectSocket = async () => {
            const token = await getToken()
            if (!token || !active) return

            const socket = io(SOCKET_URL, {
                transports: ["websocket"],
                withCredentials: true,
                auth: {
                    token,
                    chatId,
                },
            })

            socketRef.current = socket
            setIsConnecting(true)
            setSocketError(null)

            socket.on("connect", () => {
                setConnected(true)
                setIsConnecting(false)
                console.log("Socket connected:", socket.id)
            })

            socket.on("disconnect", (reason) => {
                setConnected(false)
                if (reason !== "io client disconnect") {
                    setSocketError("Connection lost")
                }
                console.log("Socket disconnected")
            })

            socket.on("connect_error", (err) => {
                setSocketError(err.message)
                setIsConnecting(false)
                console.error("Socket error:", err.message)
            })

            socket.on("new_message", (message: SocketMessage) => {
                onNewMessage(message)
            })

            socket.on("typing", ({ userId }: TypingUser) => {
                setTypingUsers((prev) =>
                    prev.includes(userId) ? prev : [...prev, userId]
                )
            })

            socket.on("stop_typing", ({ userId }: TypingUser) => {
                setTypingUsers((prev) => prev.filter((id) => id !== userId))
            })
        }

        connectSocket()

        return () => {
            active = false

            if (socketRef.current) {
                socketRef.current.removeAllListeners()
                socketRef.current.disconnect()
                socketRef.current = null
            }

            setIsConnecting(false)
            setSocketError(null)
            setTypingUsers([])
            setConnected(false)
        }
    }, [chatId, userId, getToken, onNewMessage])

    const sendMessage = useCallback((content: string) => {
        const socket = socketRef.current
        if (!socket || !content.trim()) return

        socket.emit("send_message", {
            content: content.trim(),
        })
    }, [])

    const startTyping = useCallback(() => {
        const socket = socketRef.current
        if (!socket) return

        socket.emit("typing")

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing")
        }, 1500)
    }, [])

    const stopTyping = useCallback(() => {
        const socket = socketRef.current
        if (!socket) return

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }

        socket.emit("stop_typing")
    }, [])

    return {
        connected,
        isConnecting,
        socketError,
        typingUsers,
        sendMessage,
        startTyping,
        stopTyping,
    }
}
