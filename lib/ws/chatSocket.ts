import { WsClient } from "./wsClient"

const sockets = new Map<string, WsClient>();

export function getChatSocket(token: string, chatId: string): WsClient {
  const existing = sockets.get(chatId);

  if (existing) {
    if (existing.connected) return existing;

    existing.disconnect();
    sockets.delete(chatId);
  }

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  if (!url) {
    throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
  }

  console.log("Creating Socket.IO connection with auth:", { 
    token: token ? `${token.substring(0, 10)}...` : 'MISSING', 
    chatId,
    url
  });

  const socket = new WsClient(url, {
    token, chatId
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  socket.on("error", (error) => {
    console.error("Socket error:", error)
  })

  sockets.set(chatId, socket);
  return socket;
}

export function resetChatSocket(chatId?: string) {
  if (chatId !== undefined) {
    const socket = sockets.get(chatId);
    socket?.disconnect();
    sockets.delete(chatId);
    return;
  }

  for (const socket of sockets.values()) {
    socket.disconnect();
  }
  sockets.clear();
}

export function hasChatSocket(chatId: string) {
  return sockets.has(chatId);
}

export function closeAllSockets() {
  resetChatSocket();
}