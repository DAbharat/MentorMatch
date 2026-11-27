"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DM_Sans } from "next/font/google";
import {
  AlertCircle,
  BellOff,
  CheckCheck,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import NotificationCard from "@/components/notifications/NotificationCard";
import {
  FetchAllNotifications,
  deleteAllNotifications,
  markAllNotificationsAsRead,
} from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
};

type FilterType = "all" | "unread" | "read";

function NotificationsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#11140e] border border-[#242a1e] rounded-2xl divide-y divide-[#1e2419] overflow-hidden"
    >
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="p-5 flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-xl bg-[#161b12] shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-48 bg-[#1b2116]" />
              <Skeleton className="h-3 w-16 bg-[#161b12]" />
            </div>
            <Skeleton className="h-4 w-full max-w-lg bg-[#161b12]" />
            <Skeleton className="h-3 w-28 bg-[#161b12]" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading notifications...</span>
    </div>
  );
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const fetchNotifications = useCallback(
    async (selectedFilter: FilterType) => {
      try {
        setLoading(true);
        setError(null);

        const data = await FetchAllNotifications({
          limit: 10,
          filter: selectedFilter,
        });

        setNotifications(data.notifications || []);
        setNextCursor(data.nextCursor ?? null);
        if (typeof data.unreadCount === "number") {
          setTotalUnreadCount(data.unreadCount);
        } else {
          setTotalUnreadCount(
            (data.notifications || []).filter((n: Notification) => !n.isRead)
              .length
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load notifications.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const data = await FetchAllNotifications({
        limit: 10,
        filter,
        cursor: nextCursor,
      });
      setNotifications((prev) => [...prev, ...(data.notifications || [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load more notifications.";
      toast.error(errorMessage);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsProcessing(true);
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
      setTotalUnreadCount(0);
      await fetchNotifications(filter);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to mark notifications as read";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsProcessing(true);
      await deleteAllNotifications();
      toast.success("All notifications deleted");
      setNotifications([]);
      setNextCursor(null);
      setTotalUnreadCount(0);
      setShowDeleteAllDialog(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete notifications";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotificationDeleted = (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    if (target && !target.isRead) {
      setTotalUnreadCount((count) => Math.max(0, count - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleNotificationRead = (notificationId: string) => {
    setTotalUnreadCount((count) => Math.max(0, count - 1));
    if (filter === "unread") {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
  ];

  return (
    <div
      className={`min-h-screen bg-[#090a08] text-[#f2f0e8] selection:bg-[#8fa654]/30 selection:text-[#f2f0e8] py-8 sm:py-10 pb-16 ${DM_Sans_Font.className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#242a1e]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f2f0e8] tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-[#a8ab9e] mt-1 tabular-nums">
              {loading
                ? "Syncing your recent activity..."
                : totalUnreadCount > 0
                ? `${totalUnreadCount} unread notification${
                    totalUnreadCount === 1 ? "" : "s"
                  }`
                : "You are all caught up"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isProcessing || totalUnreadCount === 0}
              className="h-11 px-4 rounded-xl bg-[#11140e] border border-[#5d6a4f] text-[#f2f0e8] hover:bg-[#161b12] hover:border-[#8fa654] text-xs sm:text-sm font-medium transition-colors motion-reduce:transition-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <CheckCheck
                className="w-4 h-4 text-[#5ee0aa]"
                aria-hidden="true"
              />
              Mark all read
            </Button>

            <Button
              type="button"
              onClick={() => setShowDeleteAllDialog(true)}
              disabled={isProcessing || notifications.length === 0}
              className="h-11 px-4 rounded-xl bg-[#11140e] border border-[#61282d] text-[#f4b8bc] hover:bg-[#231214] hover:border-[#8e3b42] text-xs sm:text-sm font-medium transition-colors motion-reduce:transition-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Trash2
                className="w-4 h-4 text-[#eb7b83]"
                aria-hidden="true"
              />
              Delete all
            </Button>
          </div>
        </header>

        {/* Direct Filter Tabs */}
        <div className="flex items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="inline-flex items-center p-1 rounded-xl bg-[#11140e] border border-[#242a1e]"
          >
            {filters.map(({ id, label }) => {
              const isActive = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(id)}
                  className={`h-9 px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] ${
                    isActive
                      ? "bg-[#8fa654] text-[#0b0d08] font-semibold"
                      : "text-[#c7cabf] hover:text-[#f2f0e8] hover:bg-[#161b12]"
                  }`}
                >
                  <span>{label}</span>
                  {id === "unread" && totalUnreadCount > 0 && (
                    <span
                      className={`ml-1.5 text-xs tabular-nums ${
                        isActive ? "text-[#0b0d08]" : "text-[#b7cc7e]"
                      }`}
                    >
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Stream */}
        {loading ? (
          <NotificationsSkeleton />
        ) : error ? (
          <div className="bg-[#11140e] border border-[#5d6a4f] rounded-2xl p-6 space-y-4">
            <div className="rounded-xl border border-[#8e3b42] bg-[#231214] p-4 flex items-start gap-2.5">
              <AlertCircle
                className="w-4 h-4 text-[#eb7b83] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-[#f4b8bc]">
                  Unable to load notifications
                </p>
                <p className="text-xs text-[#f4b8bc] mt-1">{error}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => fetchNotifications(filter)}
              className="h-11 px-5 bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#11140e] border border-[#242a1e] rounded-2xl px-6 py-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#161b12] border border-[#3d4d2a] text-[#b7cc7e] flex items-center justify-center mx-auto">
              <BellOff className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f2f0e8]">
                {filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                  ? "No read notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-xs sm:text-sm text-[#a8ab9e] mt-1">
                {filter === "unread"
                  ? "Everything in your inbox has been reviewed."
                  : "Mentorship requests, session confirmations, and reminders will show up here."}
              </p>
            </div>
            {filter !== "all" && (
              <Button
                type="button"
                onClick={() => setFilter("all")}
                className="h-10 px-4 mt-1 rounded-xl bg-[#161b12] border border-[#5d6a4f] hover:border-[#8fa654] text-xs font-medium text-[#f2f0e8] cursor-pointer"
              >
                Show all notifications
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#11140e] border border-[#242a1e] rounded-2xl divide-y divide-[#1e2419] overflow-hidden">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.title}
                  message={notification.message}
                  type={notification.type}
                  isRead={notification.isRead}
                  createdAt={notification.createdAt}
                  sender={notification.sender}
                  onDeleted={handleNotificationDeleted}
                  onRead={handleNotificationRead}
                />
              ))}
            </div>

            {nextCursor && (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="h-11 px-5 rounded-xl bg-[#11140e] border border-[#5d6a4f] hover:bg-[#161b12] hover:border-[#8fa654] text-sm font-medium text-[#f2f0e8] cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin motion-reduce:animate-none text-[#b7cc7e]"
                        aria-hidden="true"
                      />
                      Loading more...
                    </>
                  ) : (
                    "Load older notifications"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto bg-[#11140e] border border-[#242a1e] text-[#f2f0e8] rounded-2xl shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f2f0e8]">
              Delete all notifications?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#a8ab9e]">
              This action cannot be undone. All notifications will be
              permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto bg-[#0d0f0b] text-[#c7cabf] border-[#5d6a4f] hover:bg-[#161b12] hover:text-[#f2f0e8] hover:border-[#8fa654] rounded-xl cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isProcessing}
              className="bg-[#7a282e] hover:bg-[#8f3138] text-[#f2f0e8] border border-[#9e3c43] w-full sm:w-auto rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Deleting..." : "Delete all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
