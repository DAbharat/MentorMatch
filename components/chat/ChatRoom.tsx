"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import SenderCard from "@/components/messages/SenderCard";
import ReceiverCard from "@/components/messages/ReceiverCard";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; name: string };
  category?: string;
  isRead?: boolean;
  isDelivered?: boolean;
};

type ChatRoomProps = {
  roomName: string;
  topicName?: string;
  messages: Message[];
  currentUserId: string;
  otherUserId: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => Promise<void>;
  isTyping: boolean;
  onBack: () => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

export default function ChatRoom({
  roomName,
  topicName,
  messages,
  currentUserId,
  otherUserId,
  isLoading,
  error,
  onRetry,
  hasMore,
  isLoadingMore,
  loadMoreError,
  onLoadMore,
  isTyping,
  onBack,
}: ChatRoomProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollRef = useRef<{ height: number; top: number } | null>(null);
  const skipAutoScrollRef = useRef(false);

  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = formatDate(message.createdAt);
      groups[date] ??= [];
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>
  );

  const initials =
    roomName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "?";

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (isLoadingMore || !container || !previousScrollRef.current) return;

    const { height, top } = previousScrollRef.current;
    container.scrollTop = top + container.scrollHeight - height;
    previousScrollRef.current = null;
  }, [isLoadingMore, messages]);

  useEffect(() => {
    if (isLoadingMore) {
      skipAutoScrollRef.current = true;
      return;
    }
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }
    if (!isLoading && messages.length > 0) {
      const container = messagesContainerRef.current;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";
      container?.scrollTo({ top: container.scrollHeight, behavior });
    }
  }, [isLoading, isLoadingMore, messages]);

  const handleLoadMore = async () => {
    const container = messagesContainerRef.current;
    if (container) {
      previousScrollRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop,
      };
    }
    await onLoadMore();
  };

  return (
    <section
      aria-label={`Conversation with ${roomName}`}
      className="flex min-h-0 flex-1 flex-col bg-[#090a08]"
    >
      <header className="shrink-0 border-b border-[#1e2419]">
        <div className="px-4 sm:px-6">
          <div className="mx-auto flex min-h-[4.25rem] w-full max-w-3xl items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#c7cabf] transition-colors hover:bg-[#161b12] hover:text-[#f2f0e8] active:bg-[#1b2116] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Messages</span>
            </button>

            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1b2116] text-xs font-semibold text-[#b7cc7e]"
            >
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-[#f2f0e8] sm:text-base">
                <Link
                  href={`/profile/${otherUserId}`}
                  className="rounded-sm transition-colors hover:text-[#cde099] active:text-[#b7cc7e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
                >
                  {roomName}
                </Link>
              </h1>
              <p className="truncate text-xs text-[#a8ab9e]">
                {topicName || "Mentorship conversation"}
              </p>
            </div>

            <Link
              href="/sessions"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[#c7cabf] transition-colors hover:bg-[#161b12] hover:text-[#f2f0e8] active:bg-[#1b2116] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] sm:px-3"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>Sessions</span>
            </Link>
          </div>
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        role="region"
        aria-label="Conversation messages"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa654]/50 sm:px-6 sm:py-5"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
          {isLoading ? (
            <div
              role="status"
              className="flex flex-1 items-center justify-center text-sm text-[#a8ab9e]"
            >
              Loading messages...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
            >
              <p className="text-sm font-medium text-[#f2f0e8]">
                Couldn&apos;t load this conversation.
              </p>
              <p className="max-w-sm text-sm text-[#a8ab9e]">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#b7cc7e] underline decoration-[#4d5c33] underline-offset-4 hover:text-[#cde099] active:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-base font-medium text-[#f2f0e8]">
                Start the conversation
              </p>
              <p className="max-w-sm text-sm text-[#a8ab9e]">
                Send {roomName} a message about {topicName || "your mentorship"}.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-auto">
                {hasMore && (
                  <div className="mb-4 flex flex-col items-center gap-1">
                    {loadMoreError && (
                      <p role="alert" className="text-xs text-[#f4b8bc]">
                        {loadMoreError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="min-h-11 rounded-lg px-3 text-xs font-medium text-[#b7cc7e] underline decoration-[#4d5c33] underline-offset-4 hover:text-[#cde099] active:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoadingMore
                        ? "Loading earlier messages..."
                        : loadMoreError
                          ? "Try again"
                          : "Load earlier messages"}
                    </button>
                  </div>
                )}

                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 py-5">
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-[#1e2419]"
                      />
                      <p className="text-[11px] font-medium text-[#8a8f80]">
                        {date}
                      </p>
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-[#1e2419]"
                      />
                    </div>
                    <ol
                      aria-label={`Messages from ${date}`}
                      className="space-y-2"
                    >
                      {dateMessages.map((message) => (
                        <li key={message.id}>
                          {message.senderId === currentUserId ? (
                            <SenderCard
                              content={message.content}
                              createdAt={message.createdAt}
                              isRead={message.isRead}
                              isDelivered={message.isDelivered}
                            />
                          ) : (
                            <ReceiverCard
                              content={message.content}
                              createdAt={message.createdAt}
                              category={message.category}
                            />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                {isTyping && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-3 text-xs text-[#a8ab9e]"
                  >
                    {roomName} is typing...
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}