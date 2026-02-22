"use client";

import Link from "next/link";
import { Bell, User2 } from "lucide-react";
import { DM_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SearchBar from "../search/search";
import { useEffect, useState } from "react";
import { FetchAllNotifications } from "@/services/notification.service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

//TODO: Add tooltip (shadcn)

export default function Navbar() {
    const router = useRouter();

    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
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
                toast.error("Failed to load notifications. Please try again later.")
            }
        }
        fetchNotifications()
    }, [])

    return (
        <nav
            className={`${DM_Sans_Font.className} fixed top-0 left-0 right-0 z-50 bg-[#0b090a] border-b border-[#1f1f1f] shadow-sm`}
        >
            <div className="w-full pl-2 pr-3 sm:pl-3 sm:pr-4 md:pl-4 md:pr-6 lg:pl-6 lg:pr-8">
                {/* Mobile and Tablet Layout */}
                <div className="flex md:hidden items-center gap-2 sm:gap-3 h-14 sm:h-16">
                    {/* Left - Sidebar + Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <SidebarTrigger className=" text-white hover:bg-blue-500 hover:text-white cursor-pointer" />
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 sm:gap-2 group"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <span className="text-white font-bold text-xs sm:text-base tracking-wide">
                                    MM
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Middle - Search Bar */}
                    <div className="flex-1 mx-2">
                        <SearchBar />
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            className="relative p-1.5 sm:p-2 text-white hover:bg-white rounded-lg transition-colors"
                            aria-label="Notifications"
                            onClick={() => { router.push(`/notifications`) }}
                        >
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <User2
                            className="w-7 h-7 sm:w-8 sm:h-8 p-1.5 text-white cursor-pointer bg-transparent rounded-full transition-colors"
                            onClick={() => router.push("/profile")}
                        />
                    </div>
                </div>

                {/* Desktop/Laptop Layout - Centered Search */}
                <div className="hidden md:grid grid-cols-[minmax(300px,1fr)_minmax(600px,900px)_minmax(200px,1fr)] items-center gap-4 lg:gap-6 h-16 max-w-6xl mx-auto">
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="text-white hover:bg-transparent hover:text-white cursor-pointer" />
                        <Link
                            href="/"
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <span className="text-white font-bold text-base tracking-wide">
                                    MM
                                </span>
                            </div>

                            <span className="text-lg font-semibold text-white tracking-tight whitespace-nowrap">
                                Mentor<span className="font-bold">Match</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center - Search Bar */}
                    <div className="w-full">
                        <SearchBar />
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3 justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="relative p-2 text-white rounded-lg transition-colors cursor-pointer"
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
                                    className="w-8 h-8 p-1.5 text-white cursor-pointer bg-transparent rounded-full transition-colors"
                                    onClick={() => router.push("/profile")}
                                />
                            </TooltipTrigger>
                            <TooltipContent>Profile</TooltipContent>
                        </Tooltip>

                    </div>
                </div>
            </div>
        </nav>
    );
}