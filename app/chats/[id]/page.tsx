"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { refresh } from '@/services/account.service'
import ChatRoom from '@/components/chat/ChatRoom'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useChatSocket } from '@/hooks/useChatSocket'
import { fetchAllChatsForAUser, markChatMessagesAsRead } from '@/services/messages.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { DM_Sans } from "next/font/google"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

export default function ChatRoomPage() {
    const params = useParams()
    const router = useRouter()
    const { userId, isLoading: authLoading } = useAuth()
    const chatId = params.id as string
    
    const [token, setToken] = useState<string | null>(null)

    const [chatDetails, setChatDetails] = useState<any>(null)
    const [messageInput, setMessageInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [otherUser, setOtherUser] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const hasMarkedAsReadRef = useRef(false)

    // Refresh token and get a fresh one before socket connection
    useEffect(() => {
        const refreshAndSetToken = async () => {
            try {
                // Only refresh if user is authenticated
                const storedToken = localStorage.getItem('authToken')
                if (!storedToken) {
                    // User not authenticated, redirect to login
                    router.push("/sign-in")
                    return
                }

                // Call refresh service to ensure token is fresh
                const newToken = await refresh()
                
                if (newToken) {
                    // Store the fresh token in localStorage
                    localStorage.setItem('authToken', newToken)
                    setToken(newToken)
                } else {
                    toast.error("Failed to retrieve authentication token")
                }
            } catch (error) {
                console.error("Failed to refresh token:", error)
                // If refresh fails, user needs to login again
                router.push("/sign-in")
            }
        }

        if (typeof window !== 'undefined' && userId) {
            refreshAndSetToken()
        }
    }, [userId, router])

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    const { messages, isLoading, appendMessage } = useChatMessages(chatId)

    const handleNewMessage = useCallback((message: any) => {
        appendMessage(message)
        scrollToBottom()
    }, [appendMessage, scrollToBottom])

    const { socket, connected, isConnecting, socketError, typingUsers, emitTyping, emitStopTyping } = useChatSocket({
        token: token || undefined,
        chatId,
        onNewMessage: handleNewMessage,
    })

    useEffect(() => {
        const fetchChatDetails = async () => {
            try {
                const response = await fetchAllChatsForAUser()
                const allChats = response.chats
                const currentChat = allChats.find((chat: any) => chat.id === chatId)
                
                if (currentChat) {
                    setChatDetails(currentChat)
                    
                    // Determine the other user
                    const other = currentChat.mentor.userId === userId 
                        ? currentChat.mentor 
                        : currentChat.mentee
                    setOtherUser(other)
                }
            } catch (error) {
                console.error("Failed to fetch chat details:", error)
                toast.error("Failed to load chat details")
            }
        }

        if (userId) {
            fetchChatDetails()
        }
    }, [chatId, userId])

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom()
        }
    }, [messages, scrollToBottom])

    useEffect(() => {
        if (chatId && userId && !hasMarkedAsReadRef.current) {
            hasMarkedAsReadRef.current = true
            markChatMessagesAsRead(chatId)
                .then(() => {
                    console.log("Messages marked as read")
                })
                .catch((error) => {
                    console.error("Failed to mark messages as read:", error)
                })
        }
    }, [chatId, userId])

    // Handle message sending
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!messageInput.trim() || isSending) return
        if (!socket?.connected) {
            toast.error("Connection error. Please wait...")
            return
        }

        const content = messageInput.trim()
        setMessageInput('')
        setIsSending(true)
        emitStopTyping()

        try {
            socket.emit("send_message", { content })
        } catch (error: any) {
            console.error("Failed to send message:", error)
            toast.error(error.message || "Failed to send message")
            setMessageInput(content)
        } finally {
            setIsSending(false)
            inputRef.current?.focus()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value)
        if (e.target.value.trim()) {
            emitTyping()
        } else {
            emitStopTyping()
        }
    }

    const handleVideoCall = () => {
        if (!otherUser) return
        
        router.push(`/sessions/video-call?chatId=${chatId}&userId=${otherUser.userId}`)
        
        toast.info("Starting video call...")
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        )
    }

    if (!userId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Unauthorized</p>
            </div>
        )
    }

    if (!chatDetails || !otherUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Chat not found</p>
            </div>
        )
    }

    return (
        <div className={`${DM_Sans_Font.className} flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-full overflow-hidden bg-background`}>
            {/* Chat Room */}
            <div className="flex-1 overflow-hidden min-h-0">
                <ChatRoom
                    roomName={otherUser.name}
                    lastSeen={connected ? "online" : "offline"}
                    messages={messages}
                    currentUserId={userId}
                    otherUserId={otherUser.id}
                    onVideoCall={handleVideoCall}
                    onBack={() => router.back()}
                />
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-3 sm:px-4 py-1 text-xs sm:text-sm text-muted-foreground italic border-t shrink-0">
                    {otherUser.name} is typing...
                </div>
            )}

            {/* Connection Status */}
            {isConnecting && (
                <div className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs text-[#d3d3d3] bg-[#0b090a] dark:bg-amber-950/30 text-center shrink-0">
                    Connecting to chat...
                </div>
            )}
            {socketError && (
                <div className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs text-red-600 bg-[#0b090a] dark:bg-red-950/30 text-center shrink-0">
                    Connection error. Messages may not update in real-time.
                </div>
            )}

            {/* Message Input */}
            <div className=" bg-[#0b090a] p-2 sm:p-3 md:p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        disabled={isSending}
                        className="flex-1 text-xs sm:text-sm border border-[#222222] text-[#d3d3d3]"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!messageInput.trim() || isSending}
                        className="h-9 w-9 sm:h-10 sm:w-10 bg-[#00ff2a] text-white"
                    >
                        {isSending ? (
                            <Spinner className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
