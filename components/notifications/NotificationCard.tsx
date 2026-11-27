"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCheck,
  MessageSquareHeart,
  MoreVertical,
  Trash2,
  UserPlus,
  Video,
  XCircle,
} from "lucide-react";
import { DM_Sans } from "next/font/google";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { checkMentorshipSessionStatus } from "@/services/session.service";
import {
  deleteNotificationById,
  markSingleNotificationAsRead,
} from "@/services/notification.service";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type NotificationCardProps = {
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
  onDeleted?: (notificationId: string) => void;
  onRead?: (notificationId: string) => void;
};

type CategoryTheme = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pill: string;
};

function getCategoryTheme(type: string): CategoryTheme {
  switch (type) {
    case "MENTORSHIP_REQUEST_ACCEPTED":
      return {
        label: "Request accepted",
        icon: CalendarCheck2,
        pill: "bg-[#0e1d17] border-[#245944] text-[#5ee0aa]",
      };
    case "SESSION_CONFIRMED":
      return {
        label: "Session confirmed",
        icon: CalendarCheck2,
        pill: "bg-[#0e1d17] border-[#245944] text-[#5ee0aa]",
      };
    case "FEEDBACK_RECEIVED":
    case "FEEDBACK_SENT":
      return {
        label: "Feedback",
        icon: MessageSquareHeart,
        pill: "bg-[#0e1d17] border-[#245944] text-[#5ee0aa]",
      };
    case "SESSION_SCHEDULED":
    case "SESSION_REMINDER":
      return {
        label: type === "SESSION_REMINDER" ? "Reminder" : "Scheduled",
        icon: CalendarClock,
        pill: "bg-[#1f190d] border-[#5e471a] text-[#f7c95c]",
      };
    case "SESSION_STARTED":
      return {
        label: "Session live",
        icon: Video,
        pill: "bg-[#0d1a24] border-[#214f6e] text-[#67cdfa]",
      };
    case "MENTORSHIP_REQUEST_REJECTED":
    case "SESSION_CANCELLED":
      return {
        label:
          type === "SESSION_CANCELLED" ? "Cancelled" : "Request declined",
        icon: XCircle,
        pill: "bg-[#231214] border-[#61282d] text-[#f4b8bc]",
      };
    case "MENTORSHIP_REQUEST_RECEIVED":
    case "MENTORSHIP_REQUEST_SENT":
      return {
        label:
          type === "MENTORSHIP_REQUEST_RECEIVED"
            ? "New request"
            : "Request sent",
        icon: UserPlus,
        pill: "bg-[#161b12] border-[#3d4d2a] text-[#b7cc7e]",
      };
    default:
      return {
        label: "Update",
        icon: Bell,
        pill: "bg-[#161b12] border-[#3d4d2a] text-[#b7cc7e]",
      };
  }
}

const sessionStatusStyles: Record<string, string> = {
  PENDING: "bg-[#1f190d] border-[#5e471a] text-[#f7c95c]",
  CONFIRMED: "bg-[#0e1d17] border-[#245944] text-[#5ee0aa]",
  IN_PROGRESS: "bg-[#0d1a24] border-[#214f6e] text-[#67cdfa]",
  COMPLETED: "bg-[#161b12] border-[#3d4d2a] text-[#b7cc7e]",
  CANCELLED: "bg-[#231214] border-[#61282d] text-[#f4b8bc]",
};

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function NotificationCard({
  id,
  title,
  message,
  type,
  isRead,
  createdAt,
  sender,
  onDeleted,
  onRead,
}: NotificationCardProps) {
  const router = useRouter();
  const senderName = sender?.name || "MentorMatch";
  const showScheduleButton = type === "MENTORSHIP_REQUEST_ACCEPTED";
  const theme = getCategoryTheme(type);
  const CategoryIcon = theme.icon;

  const [sessionStatus, setSessionStatus] = useState<{
    hasSession: boolean;
    status: string | null;
  }>({ hasSession: false, status: null });
  const [checkingSession, setCheckingSession] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (showScheduleButton && sender?.id) {
        try {
          const result = await checkMentorshipSessionStatus(sender.id);
          setSessionStatus(result);
        } catch (error) {
          console.error("Error checking session status:", error);
        } finally {
          setCheckingSession(false);
        }
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [showScheduleButton, sender?.id]);

  const handleScheduleSession = () => {
    if (sender?.id) {
      router.push(`/sessions/schedule/${sender.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNotificationById(id);
      toast.success("Notification deleted");
      onDeleted?.(id);
      setShowDeleteDialog(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to delete notification";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isRead) return;

    try {
      setIsMarkingRead(true);
      await markSingleNotificationAsRead(id);
      toast.success("Marked as read");
      onRead?.(id);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to mark as read";
      toast.error(msg);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const renderActionButton = () => {
    if (!showScheduleButton) return null;

    if (checkingSession) {
      return (
        <p className="text-xs text-[#8a8f80]">Checking session status...</p>
      );
    }

    if (sessionStatus.hasSession) {
      const statusKey = sessionStatus.status || "";
      const badgeStyle =
        sessionStatusStyles[statusKey] ||
        "bg-[#161b12] border-[#3d4d2a] text-[#b7cc7e]";

      return (
        <Badge
          variant="outline"
          className={`${badgeStyle} border text-xs font-medium px-2.5 py-0.5 rounded-lg`}
        >
          Session {statusKey.toLowerCase().replace("_", " ") || "created"}
        </Badge>
      );
    }

    return (
      <Button
        type="button"
        onClick={handleScheduleSession}
        className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#8fa654]"
      >
        Schedule session
      </Button>
    );
  };

  return (
    <article
      className={`${DM_Sans_Font.className} relative px-4 sm:px-6 py-4 sm:py-5 transition-colors motion-reduce:transition-none ${
        !isRead
          ? "bg-[#141911] hover:bg-[#171d14]"
          : "bg-[#11140e] hover:bg-[#141811]"
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <CategoryIcon
          className="mt-0.5 h-5 w-5 shrink-0 text-[#9a9e91]"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
              {!isRead && (
                <span
                  className="inline-block w-2 h-2 rounded-full bg-[#8fa654] shrink-0"
                  title="Unread notification"
                >
                  <span className="sr-only">Unread</span>
                </span>
              )}

              <h2
                className={`text-sm sm:text-[15px] leading-snug ${
                  !isRead
                    ? "font-semibold text-[#f2f0e8]"
                    : "font-medium text-[#c7cabf]"
                }`}
              >
                {title || theme.label}
              </h2>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${theme.pill}`}
              >
                {theme.label}
              </span>
            </div>

            {/* Timestamp + Row Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <time
                dateTime={createdAt}
                title={new Date(createdAt).toLocaleString()}
                className="text-xs text-[#8a8f80] whitespace-nowrap mr-1 tabular-nums"
              >
                {formatNotificationTime(createdAt)}
              </time>

              {!isRead && (
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead}
                  aria-label="Mark notification as read"
                  title="Mark as read"
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg border border-transparent hover:border-[#5d6a4f] hover:bg-[#1b2116] text-[#b7cc7e] flex items-center justify-center transition-colors motion-reduce:transition-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Notification actions"
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg border border-transparent hover:border-[#5d6a4f] hover:bg-[#1b2116] text-[#a8ab9e] hover:text-[#f2f0e8] flex items-center justify-center transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                  >
                    <MoreVertical className="w-4 h-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-[#11140e] border border-[#242a1e] text-[#f2f0e8] rounded-xl p-1 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)]"
                >
                  <DropdownMenuItem
                    onClick={handleMarkAsRead}
                    disabled={isMarkingRead || isRead}
                    className="rounded-lg text-sm text-[#c7cabf] focus:bg-[#1b2116] focus:text-[#f2f0e8] cursor-pointer disabled:opacity-50"
                  >
                    <CheckCheck
                      className="w-4 h-4 mr-2 text-[#5ee0aa]"
                      aria-hidden="true"
                    />
                    Mark as read
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#1e2419]" />
                  <DropdownMenuItem
                    className="rounded-lg text-sm text-[#f4b8bc] focus:bg-[#231214] focus:text-[#f4b8bc] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2
                      className="w-4 h-4 mr-2 text-[#eb7b83]"
                      aria-hidden="true"
                    />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p
            className={`mt-1.5 text-sm leading-relaxed break-words ${
              !isRead ? "text-[#c7cabf]" : "text-[#a8ab9e]"
            }`}
          >
            {message}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            {sender?.id ? (
              <Link
                href={`/profile/${sender.id}`}
                className="text-xs font-medium text-[#b7cc7e] hover:text-[#cde099] underline underline-offset-4 decoration-[#4d5c33] hover:decoration-[#cde099] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] rounded"
              >
                From {senderName}
              </Link>
            ) : (
              <span className="text-xs text-[#8a8f80]">From {senderName}</span>
            )}

            {showScheduleButton && renderActionButton()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#11140e] border border-[#242a1e] text-[#f2f0e8] rounded-2xl shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f2f0e8]">
              Delete notification?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#a8ab9e]">
              This action cannot be undone. This notification will be
              permanently removed from your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-[#0d0f0b] text-[#c7cabf] border-[#5d6a4f] hover:bg-[#161b12] hover:text-[#f2f0e8] hover:border-[#8fa654] rounded-xl cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#7a282e] hover:bg-[#8f3138] text-[#f2f0e8] border border-[#9e3c43] rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
