"use client"

import ChatCard from '@/components/chat/ChatCard';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { fetchAllChatsForAUser } from '@/services/messages.service';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { DM_Sans } from "next/font/google"
import { Search } from 'lucide-react'

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Chat = {
    id: string;
    mentor: {
        id: string;
        name: string;
    }
    mentee: {
        id: string;
        name: string;
    }
    messages: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
        sender: {
            id: string;
            name: string;
        }
    }[]
    _count: {
        messages: number;
    }
}

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { userId, isLoading: authLoading } = useAuth();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoading(true);
                const response = await fetchAllChatsForAUser();
                setChats(response.chats || []);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const handleSubmit = () => {
        setSearchQuery(searchInput);
    };

    // Filter chats based on search query
    const filteredChats = chats.filter((chat) => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const mentorName = chat.mentor.name.toLowerCase();
        const menteeName = chat.mentee.name.toLowerCase();
        
        return mentorName.includes(query) || menteeName.includes(query);
    });

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Unauthorized</p>
            </div>
        );
    }

    return (
        <div className={`${DM_Sans_Font.className} container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl`}>
            {/* <h1 className="text-2xl font-bold mb-6">Messages</h1> */}
            
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    className="w-full h-11 sm:h-12 pl-11 pr-5 bg-transparent border border-[#1f1f1f] rounded-full text-[#d3d3d3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                    placeholder="Search chats by name..."
                />
            </div>

            {filteredChats.length === 0 ? (
                <div className="flex items-center justify-center py-16 sm:py-20">
                    <p className="text-muted-foreground text-sm sm:text-base">
                        {searchQuery ? "No chats match your search" : "No chats yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3">
                    {filteredChats.map((chat) => {
                        const lastMessage = chat.messages[0];
                        if (!lastMessage) return null;

                        // Determine the other user in the chat
                        const otherUser = chat.mentor.id === userId 
                            ? chat.mentee 
                            : chat.mentor;

                        // Check if the last message was sent by the current user
                        const isYourMessage = lastMessage.sender.id === userId;

                        // Only show unread count if the message is from the other user
                        const displayUnreadCount = !isYourMessage ? chat._count.messages : 0;

                        return (
                            <ChatCard
                                key={chat.id}
                                id={chat.id}
                                content={lastMessage.content}
                                sender={otherUser}
                                createdAt={lastMessage.createdAt}
                                isYourMessage={isYourMessage}
                                unreadCount={displayUnreadCount}
                                onClick={() => router.push(`/chats/${chat.id}`)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}