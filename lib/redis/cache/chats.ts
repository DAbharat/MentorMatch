import { cacheDelete } from "../cache";

const CACHE_PREFIX = "cache:v1";

export async function invalidateChatOnNewMessage(
    mentorId: string,
    menteeId: string,
    chatId: string
) {
    const mentorChatListKey = `${CACHE_PREFIX}:chat:list:${mentorId}:all`;
    const menteeChatListKey = `${CACHE_PREFIX}:chat:list:${menteeId}:all`;

    const firstPageMessagesKey = `${CACHE_PREFIX}:chat:messages:${chatId}:first:20`;

    await Promise.all([
        cacheDelete(mentorChatListKey),
        cacheDelete(menteeChatListKey),
        cacheDelete(firstPageMessagesKey)
    ])

    console.log(`[CACHE INVALIDATION] Cleared chat caches for chat ${chatId}`)
}