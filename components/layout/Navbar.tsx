"use client";

import Link from "next/link";
import { Bell, ChevronDown, MessageCircleMore, User2 } from "lucide-react";
import { DM_Sans } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SearchBar from "../search/search";
import { useEffect, useState } from "react";
import { FetchAllNotifications } from "@/services/notification.service";
import { fetchAllChatsForAUser } from "@/services/messages.service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { logout } from "@/services/account.service";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "../ui/spinner";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId, isLoading } = useAuth();
  const isAuthenticated = !!userId;

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const isChatsActive = pathname.startsWith("/chats");
  const isNotificationsActive = pathname.startsWith("/notifications");
  const isProfileActive = pathname.startsWith("/profile");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const response = await FetchAllNotifications();
        if (response.unreadCount !== undefined) {
          setUnreadCount(response.unreadCount);
        } else if (response.notifications) {
          const unread = response.notifications.filter(
            (n: { isRead?: boolean }) => !n.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetchAllChatsForAUser();
        if (response.unreadCount !== undefined) {
          setUnreadMessagesCount(response.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchNotifications();
    fetchMessages();
  }, [isAuthenticated]);

  async function handleSignOut() {
    try {
      await logout();
      toast.success("Signed out successfully");
      setShowSignOutDialog(false);
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Logout error:", error);
    }
  }

  const navIconActions = [
    {
      label: "Messages",
      href: "/chats",
      icon: MessageCircleMore,
      isActive: isChatsActive,
      badgeCount: unreadMessagesCount,
      onOpen: () => setUnreadMessagesCount(0),
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      isActive: isNotificationsActive,
      badgeCount: unreadCount,
      onOpen: () => setUnreadCount(0),
    },
  ];

  return (
    <nav
      aria-label="Top navigation"
      className={`${DM_Sans_Font.className} fixed top-0 left-0 right-0 z-50 bg-[#090a08] border-b border-[#1e2419] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8]`}
    >
      <div className="w-full h-14 md:h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar toggle + MentorMatch mark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SidebarTrigger className="h-9 w-9 rounded-lg border border-transparent text-[#a8ab9e] hover:text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#2a3322] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 transition-colors cursor-pointer" />

          <Link
            href="/"
            className="flex items-center gap-2.5 group rounded-lg py-1 pr-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
          >
            <span className="w-8 h-8 rounded-lg bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-xs font-bold tracking-wider text-[#b7cc7e] group-hover:border-[#8fa654] transition-colors">
              MM
            </span>
            <span className="hidden sm:inline text-sm md:text-base font-semibold tracking-tight text-[#f2f0e8] whitespace-nowrap">
              MentorMatch
            </span>
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-3">
          <SearchBar />
        </div>

        {/* Right: Actions / Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAuthenticated && !isLoading ? (
            <>
              {navIconActions.map(
                ({ label, href, icon: Icon, isActive, badgeCount, onOpen }) => (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={label}
                        onClick={() => {
                          onOpen();
                          router.push(href);
                        }}
                        className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 ${
                          isActive
                            ? "bg-[#1b2116] border-[#323d28] text-[#b7cc7e]"
                            : "bg-transparent border-transparent text-[#a8ab9e] hover:text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#2a3322]"
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        {badgeCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8fa654] px-1 text-[10px] font-semibold text-[#0b0d08] tabular-nums">
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#11140e] border border-[#242a1e] text-[#f2f0e8]">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                )
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className={`h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 ${
                      isProfileActive
                        ? "bg-[#1b2116] border-[#323d28] text-[#b7cc7e]"
                        : "bg-[#11140e] border-[#242a1e] text-[#c7cabf] hover:text-[#f2f0e8] hover:border-[#3c4832]"
                    }`}
                  >
                    <User2 className="w-4 h-4" />
                    <ChevronDown className="w-3.5 h-3.5 text-[#8e9484] hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-[#11140e] border border-[#242a1e] text-[#f2f0e8] rounded-xl p-1 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)]"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="rounded-lg text-sm text-[#c7cabf] focus:bg-[#1b2116] focus:text-[#f2f0e8] cursor-pointer"
                  >
                    Profile &amp; Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#1e2419]" />
                  <DropdownMenuItem
                    onClick={() => setShowSignOutDialog(true)}
                    className="rounded-lg text-sm text-[#f4b8bc] focus:bg-[#231214] focus:text-[#f4b8bc] cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : isLoading ? (
            <div className="h-9 w-9 flex items-center justify-center">
              <Spinner className="text-[#8fa654]" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-9 px-3.5 sm:px-4 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                onClick={() => router.push("/sign-in")}
              >
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-[#11140e] border border-[#242a1e] text-[#f2f0e8] rounded-2xl shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f2f0e8]">
              Sign out of MentorMatch
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#a8ab9e]">
              You&apos;ll need to sign in again to access your messages,
              scheduled sessions, and mentorship profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2.5 justify-end pt-2">
            <AlertDialogCancel className="bg-[#0d0f0b] text-[#c7cabf] border-[#283022] hover:bg-[#161b12] hover:text-[#f2f0e8] hover:border-[#3c4832] cursor-pointer rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-[#7a282e] text-[#f2f0e8] border border-[#9e3c43] hover:bg-[#8f3138] cursor-pointer rounded-xl"
            >
              Sign out
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
