import { useCallback, useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import { getChatSocket } from "@/lib/chatSocket"

interface UseChatSocketProps {
    token: string
    chatId: string
    onNewMessage: (msg: any) => void
}

export const useChatSocket = ({
    token,
    chatId,
    onNewMessage,
}: UseChatSocketProps) => {
    const socketRef = useRef<Socket | null>(null)
    const onNewMessageRef = useRef(onNewMessage)

    const [connected, setConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(true)
    const [socketError, setSocketError] = useState<string | null>(null)
    const [typingUsers, setTypingUsers] = useState<string[]>([])

    // Keep ref updated with latest callback
    useEffect(() => {
        onNewMessageRef.current = onNewMessage
    }, [onNewMessage])

    useEffect(() => {
        if (!token || !chatId) {
            setIsConnecting(false)
            return
        }

        const socket = getChatSocket(token, chatId)
        socketRef.current = socket

        setIsConnecting(!socket.connected)

        const OnConnect = () => {
            setConnected(true)
            setIsConnecting(false)
            setSocketError(null)
        }

        const OnDisconnect = () => {
            setConnected(false)
        }

        const OnError = (err: Error) => {
            setSocketError(err.message)
            setIsConnecting(false)
        }

        const OnNewMessage = (message: any) => {
            onNewMessageRef.current(message)
        }

        socket.on("connect", OnConnect)
        socket.on("disconnect", OnDisconnect)
        socket.on("connect_error", OnError)
        socket.on("new_message", OnNewMessage)

        socket.on("typing", ({ userId }) =>
            setTypingUsers(prev =>
                prev.includes(userId) ? prev : [...prev, userId]
            )
        )
        socket.on("stop_typing", ({ userId }) =>
            setTypingUsers(prev => prev.filter(id => id !== userId))
        )

        return () => {
            socket.off("connect", OnConnect)
            socket.off("disconnect", OnDisconnect)
            socket.off("connect_error", OnError)
            socket.off("new_message", OnNewMessage)
            socket.off("typing")
            socket.off("stop_typing")

            setTypingUsers([])
            setConnected(false)
        }
    }, [token, chatId])

    const emitTyping = useCallback(() => {
        const socket = socketRef.current
        if (!socket?.connected) return
        socket.emit("typing")
    }, [])

    const emitStopTyping = useCallback(() => {
        const socket = socketRef.current
        if (!socket?.connected) return
        socket.emit("stop_typing")
    }, [])

    return {
        socket: socketRef.current,
        connected,
        isConnecting,
        socketError,
        typingUsers,
        emitTyping,
        emitStopTyping,
    }
}
