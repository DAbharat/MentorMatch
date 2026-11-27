"use client";

import { getChatPeer, type ChatSummary } from "@/components/chat/ChatCard";
import ChatRoom from "@/components/chat/ChatRoom";
import { useAuth } from "@/hooks/useAuth";
import { useChatMessages, type ChatMessage } from "@/hooks/useChatMessages";
import { useChatSocket } from "@/hooks/useChatSocket";
import { refresh } from "@/services/account.service";
import {
  fetchAllChatsForAUser,
  markChatMessagesAsRead,
} from "@/services/messages.service";
import { LoaderCircle, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function ChatRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const chatId = params.id;
  const { userId, isLoading: authLoading } = useAuth();

  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMarkedAsReadRef = useRef(false);

  const loadChats = useCallback(async () => {
    setChatsLoading(true);
    setChatsError(null);
    try {
      const response = await fetchAllChatsForAUser();
      setChats(response.chats || []);
    } catch (err: unknown) {
      console.error("Failed to fetch chats:", err);
      setChatsError(
        err instanceof Error ? err.message : "Couldn't load conversations."
      );
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setChatsLoading(false);
      return;
    }
    void loadChats();
  }, [authLoading, loadChats, userId]);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push("/sign-in");
      return;
    }

    const refreshAndSetToken = async () => {
      try {
        const newToken = await refresh();
        if (newToken) setToken(newToken);
      } catch (err: unknown) {
        console.error("Failed to refresh token for chat socket:", err);
      }
    };

    if (userId) void refreshAndSetToken();
  }, [authLoading, router, userId]);

  const {
    messages,
    isLoading: messagesLoading,
    isLoadingMore,
    hasMore,
    error: messagesError,
    loadMoreError,
    loadMore,
    retry: retryMessages,
    appendMessage,
  } = useChatMessages(chatId);

  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      appendMessage(message);
    },
    [appendMessage]
  );

  const {
    socket,
    connected,
    isConnecting,
    socketError,
    typingUsers,
    emitTyping,
    emitStopTyping,
  } = useChatSocket({
    token: token || undefined,
    chatId,
    onNewMessage: handleNewMessage,
  });

  const currentChat = useMemo(
    () => chats.find((chat) => chat.id === chatId),
    [chats, chatId]
  );
  const otherUser =
    currentChat && userId ? getChatPeer(currentChat, userId) : null;

  useEffect(() => {
    hasMarkedAsReadRef.current = false;
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !userId || hasMarkedAsReadRef.current) return;
    hasMarkedAsReadRef.current = true;
    markChatMessagesAsRead(chatId).catch((err: unknown) => {
      console.error("Failed to mark messages as read:", err);
    });
  }, [chatId, userId]);

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageInput.trim();

    if (!content || isSending) return;
    if (!connected || !socket) {
      toast.error("Chat is reconnecting. Try sending again in a moment.");
      return;
    }

    setMessageInput("");
    setIsSending(true);
    emitStopTyping();

    try {
      socket.emit("send_message", { content });
    } catch (err: unknown) {
      console.error("Failed to send message:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
      setMessageInput(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(event.target.value);
    if (event.target.value.trim()) {
      emitTyping();
    } else {
      emitStopTyping();
    }
  };

  if (authLoading || chatsLoading) {
    return (
      <main className={`${dmSans.className} flex min-h-[calc(100dvh-3.5rem)] items-center justify-center gap-3 text-sm text-[#a8ab9e] md:min-h-[calc(100dvh-4rem)]`}>
        <LoaderCircle
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Loading conversation...
      </main>
    );
  }

  if (!userId) {
    return (
      <main className={`${dmSans.className} flex min-h-[calc(100dvh-3.5rem)] items-center justify-center text-sm text-[#a8ab9e] md:min-h-[calc(100dvh-4rem)]`}>
        Sign in to view this conversation.
      </main>
    );
  }

  if (chatsError) {
    return (
      <main className={`${dmSans.className} flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[calc(100dvh-4rem)]`}>
        <h1 className="text-lg font-semibold text-[#f2f0e8]">
          Couldn&apos;t load conversations.
        </h1>
        <p className="max-w-md text-sm text-[#a8ab9e]">{chatsError}</p>
        <button
          type="button"
          onClick={() => void loadChats()}
          className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#b7cc7e] underline decoration-[#4d5c33] underline-offset-4 hover:text-[#cde099] active:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!currentChat || !otherUser) {
    return (
      <main className={`${dmSans.className} flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[calc(100dvh-4rem)]`}>
        <h1 className="text-lg font-semibold text-[#f2f0e8]">
          Conversation not found
        </h1>
        <p className="text-sm text-[#a8ab9e]">
          This conversation may have been removed or may not be available to you.
        </p>
        <button
          type="button"
          onClick={() => router.push("/chats")}
          className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#b7cc7e] underline decoration-[#4d5c33] underline-offset-4 hover:text-[#cde099] active:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]"
        >
          Back to messages
        </button>
      </main>
    );
  }

  return (
    <main className={`${dmSans.className} h-[calc(100dvh-3.5rem)] w-full px-0 pb-0 md:h-[calc(100dvh-4rem)] sm:px-3 sm:pb-3 lg:px-4`}>
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <ChatRoom
          roomName={otherUser.name}
          topicName={currentChat.skill?.name}
          messages={messages}
          currentUserId={userId}
          otherUserId={otherUser.id}
          isLoading={messagesLoading}
          error={messagesError}
          onRetry={retryMessages}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          loadMoreError={loadMoreError}
          onLoadMore={loadMore}
          isTyping={typingUsers.length > 0}
          onBack={() => router.push("/chats")}
        />

        <div className="shrink-0 border-t border-[#1e2419] px-4 sm:px-6">
          <div className="mx-auto max-w-3xl py-3 sm:py-4">
            {socketError && (
              <p role="alert" className="mb-3 text-xs text-[#f4b8bc]">
                Live chat is disconnected. Messages may not update until it reconnects.
              </p>
            )}
            {isConnecting && !socketError && (
              <p role="status" className="mb-3 text-xs text-[#a8ab9e]">
                Connecting to live chat...
              </p>
            )}
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="chat-message-input"
                  className="mb-1.5 block text-xs font-medium text-[#c7cabf]"
                >
                  Message
                </label>
                <input
                  ref={inputRef}
                  id="chat-message-input"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Write a message..."
                  disabled={isSending}
                  autoComplete="off"
                  className="h-11 w-full rounded-lg border border-[#59694a] bg-[#090a08] px-3 text-sm text-[#f2f0e8] placeholder:text-[#a8ab9e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!messageInput.trim() || isSending}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#8fa654] text-[#0b0d08] transition-colors hover:bg-[#a8bd70] active:bg-[#b7cc7e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cde099] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11140e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
