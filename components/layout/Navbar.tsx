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
      className={`${DM_Sans_Font.className} fixed inset-x-0 top-0 z-50 border-b border-[#242a1e] bg-[#11140e] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8]`}
    >
      <div className="grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SidebarTrigger
            className="h-11 w-11 cursor-pointer rounded-xl border border-[#2a3322] bg-[#161b12] text-[#c7cabf] transition-colors hover:border-[#3a4530] hover:bg-[#1b2116] hover:text-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#8fa654]/50"
          />
          <Link
            href="/"
            aria-label="MentorMatch home"
            className="group hidden shrink-0 cursor-pointer items-center gap-2.5 rounded-lg py-1 pr-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 sm:flex"
          >
            {/* <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3a4530] bg-[#161b12] text-xs font-bold tracking-wider text-[#b7cc7e] transition-colors group-hover:border-[#8fa654]">
              MM
            </span> */}
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-[#f2f0e8] md:text-base">
              MentorMatch
            </span>
          </Link>
        </div>

        <div className="flex w-full min-w-0 max-w-[42rem] items-center justify-self-center px-1 sm:px-3">
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1">
          {isAuthenticated && !isLoading ? (
            <>
              {navIconActions.map(
                ({ label, href, icon: Icon, isActive, badgeCount, onOpen }) => (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={href}
                        aria-label={`${label}${badgeCount > 0 ? `, ${badgeCount} unread` : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onOpen}
                        className={`relative flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 ${isActive
                          ? "bg-[#1b2116] text-[#b7cc7e]"
                          : "text-[#9a9e91] hover:bg-[#161b12] hover:text-[#f2f0e8]"
                          }`}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]"
                        />
                        {badgeCount > 0 && (
                          <span
                            aria-hidden="true"
                            className="text-[10px] font-semibold leading-none tabular-nums text-[#b7cc7e]"
                          >
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#11140e] border border-[#242a1e] text-[#f2f0e8]">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                )
              )}

              <span aria-hidden="true" className="mx-1.5 hidden h-7 w-px bg-[#2a3322] sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 md:w-auto md:px-3 ${isProfileActive
                      ? "border-[#8fa654] bg-[#1b2116] text-[#b7cc7e]"
                      : "border-transparent text-[#c7cabf] hover:border-[#2a3322] hover:bg-[#161b12] hover:text-[#f2f0e8]"
                      }`}
                  >
                    <User2 className="w-4 h-4" />
                    <span className="hidden text-sm font-medium md:inline">Account</span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-[#8e9484] md:block" />
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
            <div role="status" aria-label="Loading account" className="flex h-11 w-11 items-center justify-center">
              <Spinner className="text-[#8fa654]" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-11 cursor-pointer rounded-xl bg-[#8fa654] px-4 text-sm font-semibold text-[#0b0d08] shadow-sm transition-colors hover:bg-[#9eb660] active:bg-[#7f9449]"
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
