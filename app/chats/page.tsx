"use client"

import ChatCard from '@/components/chat/ChatCard';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { fetchAllChatsForAUser } from '@/services/messages.service';
import { useUser } from '@clerk/nextjs';
import { Spinner } from '@/components/ui/spinner';
import { DM_Sans } from "next/font/google"

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Chat = {
    id: string;
    mentor: {
        id: string;
        name: string;
        clerkUserId: string;
    }
    mentee: {
        id: string;
        name: string;
        clerkUserId: string;
    }
    messages: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
        sender: {
            id: string;
            name: string;
            clerkUserId: string;
        }
    }[]
}

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useUser();

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">No chats yet</p>
            </div>
        );
    }

    return (
        <div className={`${DM_Sans_Font.className} container mx-auto px-4 py-6 max-w-4xl`}>
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="space-y-2">
                {chats.map((chat) => {
                    const lastMessage = chat.messages[0];
                    if (!lastMessage) return null;

                    // Determine the other user in the chat
                    const otherUser = chat.mentor.clerkUserId === user?.id 
                        ? chat.mentee 
                        : chat.mentor;

                    // Check if the last message was sent by the current user
                    const isYourMessage = lastMessage.sender.clerkUserId === user?.id;

                    return (
                        <ChatCard
                            key={chat.id}
                            id={chat.id}
                            content={lastMessage.content}
                            sender={otherUser}
                            createdAt={lastMessage.createdAt}
                            isYourMessage={isYourMessage}
                            onClick={() => router.push(`/chats/${chat.id}`)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

