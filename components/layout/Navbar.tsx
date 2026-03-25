"use client";

import Link from "next/link";
import { Bell, MessageCircleMore, User2 } from "lucide-react";
import { DM_Sans } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SearchBar from "../search/search";
import { useEffect, useState } from "react";
import { FetchAllNotifications } from "@/services/notification.service";
import { fetchAllChatsForAUser } from "@/services/messages.service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useUser } from "@clerk/nextjs";
import { Button } from "../retroui/Button";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoaded } = useUser();

    const [unreadCount, setUnreadCount] = useState(0)
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

    const isChatsActive = pathname.startsWith('/chats');
    const isNotificationsActive = pathname.startsWith('/notifications');
    const isProfileActive = pathname.startsWith('/profile');

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const response = await FetchAllNotifications()
                console.log("Navbar notifications response:", response)

                if (response.unreadCount !== undefined) {
                    setUnreadCount(response.unreadCount)
                } else if (response.notifications) {
                    const unread = response.notifications.filter((n: any) => !n.isRead).length
                    setUnreadCount(unread)
                }
            } catch (error) {
                console.error("Error fetching notifications:", error)
            }
        }

        const fetchMessages = async () => {
            try {
                const response = await fetchAllChatsForAUser()
                console.log("Navbar messages response:", response)

                if (response.unreadCount !== undefined) {
                    setUnreadMessagesCount(response.unreadCount)
                }
            } catch (error) {
                console.error("Error fetching messages:", error)
            }
        }

        fetchNotifications()
        fetchMessages()
    }, [user])

    useEffect(() => {
        if (!isNotificationsActive && unreadCount > 0) {
            setUnreadCount(0)
        }
    }, [pathname])

    useEffect(() => {
        if(!isChatsActive && unreadMessagesCount > 0) {
            setUnreadMessagesCount(0)
        }
    }, [pathname])

    return (
        <nav
            className={`${DM_Sans_Font.className} fixed top-0 left-0 right-0 z-50 bg-[#0b090a] border-b border-[#1f1f1f] shadow-sm`}
        >
            <div className="w-full pl-2 pr-3 sm:pl-3 sm:pr-4 md:pl-4 md:pr-6 lg:pl-6 lg:pr-8">

                <div className="flex md:hidden items-center gap-2 sm:gap-3 h-15 sm:h-30">

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <SidebarTrigger className=" text-white hover:bg-blue-500 hover:text-white cursor-pointer" />
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 sm:gap-2 group"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#d3d3d3] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <span className="text-black font-bold text-xs sm:text-base tracking-wide">
                                    MM
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 mx-2">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {user ? (
                            <>
                                <button
                                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                                        isChatsActive 
                                            ? 'bg-[#111315] text-white font-semibold' 
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                    aria-label="Messages"
                                    onClick={() => { router.push(`/chats`) }}
                                >
                                    <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />

                                    {unreadMessagesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                                            {unreadMessagesCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                                        isNotificationsActive 
                                            ? 'bg-[#111315] text-white font-semibold' 
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                    aria-label="Notifications"
                                    onClick={() => { router.push(`/notifications`) }}
                                >
                                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />

                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <User2
                                    className={`w-7 h-7 sm:w-8 sm:h-8 p-1.5 cursor-pointer rounded-full transition-colors ${
                                        isProfileActive 
                                            ? 'bg-[#111315] text-white font-semibold' 
                                            : 'text-white hover:bg-white/10'
                                    }`}
                                    onClick={() => router.push("/profile")}
                                />
                            </>
                        ) : (
                            <Button
                                size="sm"
                                className="bg-transparent rounded-full border border-[#d3d3d3]/50 text-[#d3d3d3] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>

                <div className="hidden md:grid grid-cols-[minmax(300px,1fr)_minmax(600px,900px)_minmax(200px,1fr)] items-center gap-4 lg:gap-6 h-16 max-w-6xl mx-auto">

                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="text-white hover:bg-transparent hover:text-white cursor-pointer" />
                        <Link
                            href="/"
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-9 h-9 bg-[#d3d3d3] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <span className="text-black font-semibold text-base tracking-wide">
                                    MM
                                </span>
                            </div>

                            <span className="text-lg font-semibold text-white tracking-tight whitespace-nowrap">
                                Mentor<span className="font-bold">Match</span>
                            </span>
                        </Link>
                    </div>

                    <div className="w-full">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                        {user ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={`relative p-3 rounded-lg transition-colors cursor-pointer ${
                                                isChatsActive 
                                                    ? 'bg-[#111315] text-white font-semibold' 
                                                    : 'text-white hover:bg-white/10'
                                            }`}
                                            aria-label="Messages"
                                            onClick={() => router.push('/chats')}
                                        >
                                            <MessageCircleMore className="w-5 h-5" />
                                            {unreadMessagesCount > 0 && (
                                                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                                                    {unreadMessagesCount}
                                                </span>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Messages</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={`relative p-3 rounded-lg transition-colors cursor-pointer ${
                                                isNotificationsActive 
                                                    ? 'bg-[#111315] text-white font-semibold' 
                                                    : 'text-white hover:bg-white/10'
                                            }`}
                                            aria-label="Notifications"
                                            onClick={() => router.push('/notifications')}
                                        >
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Notifications</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <User2
                                            className={`w-8 h-8 p-1.5 cursor-pointer rounded-full transition-colors ${
                                                isProfileActive 
                                                    ? 'bg-[#111315] text-white font-semibold' 
                                                    : 'text-white hover:bg-white/10'
                                            }`}
                                            onClick={() => router.push("/profile")}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>Profile</TooltipContent>
                                </Tooltip>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                className="bg-transparent rounded-full border border-[#d3d3d3]/50 text-[#d3d3d3] px-6 py-2"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}