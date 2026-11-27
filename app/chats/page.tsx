"use client";

import ChatCard, {
  getChatPeer,
  type ChatSummary,
} from "@/components/chat/ChatCard";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllChatsForAUser } from "@/services/messages.service";
import { LoaderCircle, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const { userId, isLoading: authLoading } = useAuth();

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllChatsForAUser();
      setChats(response.chats || []);
    } catch (err: unknown) {
      console.error("Failed to fetch chats:", err);
      setError(
        err instanceof Error ? err.message : "Couldn't load conversations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      return;
    }
    void loadChats();
  }, [authLoading, loadChats, userId]);

  const query = searchInput.trim().toLowerCase();
  const filteredChats = userId
    ? chats.filter((chat) => {
        const peer = getChatPeer(chat, userId);
        return (
          peer.name.toLowerCase().includes(query) ||
          (chat.skill?.name.toLowerCase().includes(query) ?? false)
        );
      })
    : [];

  return (
    <main className={`${dmSans.className} mx-auto min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl px-4 py-8 sm:px-6 md:min-h-[calc(100dvh-4rem)] md:py-10`}>
      <header className="mb-7 border-b border-[#242a1e] pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#f2f0e8]">
          Messages
        </h1>
        <p className="mt-1 text-sm text-[#a8ab9e]">
          Conversations with your mentorship peers.
        </p>
      </header>

      <div className="mb-5">
        <label
          htmlFor="conversation-search"
          className="mb-2 block text-sm font-medium text-[#c7cabf]"
        >
          Find a conversation
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8ab9e]"
          />
          <input
            id="conversation-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name or skill"
            className="h-12 w-full rounded-lg border border-[#59694a] bg-[#11140e] pl-10 pr-11 text-sm text-[#f2f0e8] placeholder:text-[#a8ab9e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear conversation search"
              className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md text-[#a8ab9e] transition-colors hover:bg-[#1b2116] hover:text-[#f2f0e8] active:bg-[#242a1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa654]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {authLoading || loading ? (
        <div
          role="status"
          className="flex min-h-48 items-center justify-center gap-3 text-sm text-[#a8ab9e]"
        >
          <LoaderCircle
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Loading conversations...
        </div>
      ) : !userId ? (
        <p className="py-12 text-center text-sm text-[#a8ab9e]">
          Sign in to view your conversations.
        </p>
      ) : error ? (
        <div
          role="alert"
          className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"
        >
          <p className="text-sm font-medium text-[#f2f0e8]">
            Couldn&apos;t load conversations.
          </p>
          <p className="max-w-md text-sm text-[#a8ab9e]">{error}</p>
          <button
            type="button"
            onClick={() => void loadChats()}
            className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#b7cc7e] underline decoration-[#4d5c33] underline-offset-4 hover:text-[#cde099] active:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
          >
            Try again
          </button>
        </div>
      ) : filteredChats.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#a8ab9e]">
          {query
            ? `No conversations match "${searchInput.trim()}".`
            : "No conversations yet."}
        </p>
      ) : (
        <nav
          aria-label="Conversations"
          className="divide-y divide-[#242a1e] border-y border-[#242a1e]"
        >
          {filteredChats.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              currentUserId={userId}
            />
          ))}
        </nav>
      )}
    </main>
  );
}