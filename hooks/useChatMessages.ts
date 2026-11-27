"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllMessage } from "@/services/messages.service";

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isDelivered: boolean;
  isRead: boolean;
  readAt: string | null;
  sender: {
    id: string;
    name: string;
  };
};

type MessagesResponse = {
  data: ChatMessage[];
  pagination: {
    nextCursor: string | null;
    limit: number;
  };
};

export function useChatMessages(chatId: string) {
  const activeChatIdRef = useRef(chatId);
  activeChatIdRef.current = chatId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesChatId, setMessagesChatId] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMessages = useCallback(
    async (cursor?: string) =>
      (await fetchAllMessage(chatId, 20, cursor)) as MessagesResponse,
    [chatId]
  );

  useEffect(() => {
    let mounted = true;

    if (!chatId) {
      setMessagesChatId("");
      setIsLoading(false);
      return;
    }

    setMessages([]);
    setMessagesChatId("");
    setNextCursor(null);
    setError(null);
    setLoadMoreError(null);
    setIsLoadingMore(false);
    setIsLoading(true);

    void fetchMessages()
      .then((result) => {
        if (!mounted) return;
        setMessages([...result.data].reverse());
        setMessagesChatId(chatId);
        setNextCursor(result.pagination.nextCursor);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        console.error("Failed to fetch chat messages:", err);
        setMessagesChatId(chatId);
        setError(
          err instanceof Error ? err.message : "Failed to load messages."
        );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [chatId, fetchMessages, retryCount]);

  const loadMore = useCallback(async () => {
    if (messagesChatId !== chatId || !nextCursor || isLoadingMore) return;

    const requestedChatId = chatId;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await fetchMessages(nextCursor);
      if (activeChatIdRef.current !== requestedChatId) return;
      const olderMessages = [...result.data].reverse();
      setMessages((current) => [
        ...olderMessages.filter(
          (message) => !current.some((item) => item.id === message.id)
        ),
        ...current,
      ]);
      setNextCursor(result.pagination.nextCursor);
    } catch (err: unknown) {
      if (activeChatIdRef.current !== requestedChatId) return;
      console.error("Failed to load earlier chat messages:", err);
      setLoadMoreError(
        err instanceof Error ? err.message : "Failed to load earlier messages."
      );
    } finally {
      if (activeChatIdRef.current === requestedChatId) {
        setIsLoadingMore(false);
      }
    }
  }, [chatId, fetchMessages, isLoadingMore, messagesChatId, nextCursor]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message]
    );
  }, []);

  return {
    messages: messagesChatId === chatId ? messages : [],
    isLoading: isLoading || messagesChatId !== chatId,
    isLoadingMore: messagesChatId === chatId && isLoadingMore,
    hasMore: messagesChatId === chatId && Boolean(nextCursor),
    error: messagesChatId === chatId ? error : null,
    loadMoreError: messagesChatId === chatId ? loadMoreError : null,
    loadMore,
    retry,
    appendMessage,
  };
}
