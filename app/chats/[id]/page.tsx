"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import ChatRoom from '@/components/chat/ChatRoom'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useChatSocket } from '@/hooks/useChatSocket'
import { sendMessage } from '@/services/messages.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import axios from 'axios'

export default function ChatRoomPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUser()
    const chatId = params.id as string

    const [chatDetails, setChatDetails] = useState<any>(null)
    const [messageInput, setMessageInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [otherUser, setOtherUser] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    // Hooks for messages and socket
    const { messages, isLoading, appendMessage } = useChatMessages(chatId)

    const handleNewMessage = useCallback((message: any) => {
        appendMessage(message)
        scrollToBottom()
    }, [appendMessage, scrollToBottom])

    const { connected, isConnecting, socketError, typingUsers, emitTyping, emitStopTyping } = useChatSocket({
        token: user?.id || '',
        chatId,
        onNewMessage: handleNewMessage,
    })

    // Fetch chat details
    useEffect(() => {
        const fetchChatDetails = async () => {
            try {
                const response = await axios.get(`/api/chats`)
                const allChats = response.data.chats
                const currentChat = allChats.find((chat: any) => chat.id === chatId)
                
                if (currentChat) {
                    setChatDetails(currentChat)
                    
                    // Determine the other user
                    const other = currentChat.mentor.clerkUserId === user?.id 
                        ? currentChat.mentee 
                        : currentChat.mentor
                    setOtherUser(other)
                }
            } catch (error) {
                console.error("Failed to fetch chat details:", error)
                toast.error("Failed to load chat details")
            }
        }

        if (user?.id) {
            fetchChatDetails()
        }
    }, [chatId, user?.id])

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom()
        }
    }, [messages, scrollToBottom])

    // Handle message sending
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!messageInput.trim() || isSending) return

        const content = messageInput.trim()
        setMessageInput('')
        setIsSending(true)
        emitStopTyping()

        try {
            const response = await sendMessage(chatId, content)
            // Message will be added via socket event
        } catch (error: any) {
            console.error("Failed to send message:", error)
            toast.error(error.message || "Failed to send message")
            // Restore message on error
            setMessageInput(content)
        } finally {
            setIsSending(false)
            inputRef.current?.focus()
        }
    }

    // Handle typing events
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value)
        if (e.target.value.trim()) {
            emitTyping()
        } else {
            emitStopTyping()
        }
    }

    // Handle video call
    const handleVideoCall = () => {
        if (!otherUser) return
        
        // Navigate to video call page/route or integrate ZegoCloud here
        router.push(`/sessions/video-call?chatId=${chatId}&userId=${otherUser.clerkUserId}`)
        
        // Alternative: You can implement ZegoCloud inline
        toast.info("Starting video call...")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
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
        <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* Chat Room */}
            <div className="flex-1 overflow-hidden min-h-0">
                <ChatRoom
                    roomName={otherUser.name}
                    lastSeen={connected ? "online" : "offline"}
                    messages={messages}
                    currentUserId={user?.id}
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
                <div className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 text-center shrink-0">
                    Connecting to chat...
                </div>
            )}
            {socketError && (
                <div className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs text-red-600 bg-red-50 dark:bg-red-950/30 text-center shrink-0">
                    Connection error. Messages may not update in real-time.
                </div>
            )}

            {/* Message Input */}
            <div className="border-t bg-background p-2 sm:p-3 md:p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        disabled={isSending}
                        className="flex-1 text-xs sm:text-sm"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!messageInput.trim() || isSending}
                        className="h-9 w-9 sm:h-10 sm:w-10"
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
