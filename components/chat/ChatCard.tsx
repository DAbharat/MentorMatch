"use client";

import Link from "next/link";

export type ChatSummary = {
  id: string;
  createdAt: string;
  mentor: { id: string; name: string };
  mentee: { id: string; name: string };
  skill?: { id: string; name: string } | null;
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { id: string; name: string };
  }[];
  _count: { messages: number };
};

export function getChatPeer(chat: ChatSummary, currentUserId: string) {
  return chat.mentor.id === currentUserId ? chat.mentee : chat.mentor;
}

type ChatCardProps = {
  chat: ChatSummary;
  currentUserId: string;
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (diffInSeconds < 60) return "now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatCard({
  chat,
  currentUserId,
}: ChatCardProps) {
  const peer = getChatPeer(chat, currentUserId);
  const lastMessage = chat.messages[0];
  const timestamp = lastMessage?.createdAt || chat.createdAt;
  const initials =
    peer.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase() || "?";
  const unreadCount = chat._count.messages;

  return (
    <Link
      href={`/chats/${chat.id}`}
      className="group flex min-h-20 w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-[#11140e] active:bg-[#161b12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa654]"
    >
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#161b12] text-sm font-semibold text-[#b7cc7e]"
      >
        {initials}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-baseline gap-2">
            <span
              className="truncate text-sm font-semibold text-[#c7cabf] group-hover:text-[#f2f0e8]"
            >
              {peer.name}
            </span>
            {chat.skill?.name && (
              <span className="max-w-24 truncate text-[11px] text-[#8a8f80]">
                {chat.skill.name}
              </span>
            )}
          </span>
          <time
            dateTime={timestamp}
            className="shrink-0 text-[11px] tabular-nums text-[#8a8f80]"
          >
            {formatRelativeTime(timestamp)}
          </time>
        </span>

        <span className="mt-1 flex min-w-0 items-center justify-between gap-3">
          <span className="truncate text-xs text-[#a8ab9e]">
            {lastMessage ? (
              <>
                {lastMessage.senderId === currentUserId && (
                  <span className="font-medium text-[#c7cabf]">You: </span>
                )}
                {lastMessage.content}
              </>
            ) : (
              <span className="text-[#8a8f80]">Start a conversation</span>
            )}
          </span>
          {unreadCount > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#8fa654] px-1.5 text-[11px] font-semibold tabular-nums text-[#0b0d08]">
              <span className="sr-only">Unread messages: </span>
              {unreadCount}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}