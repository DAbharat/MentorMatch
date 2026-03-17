export type WebRTCConfig = {
    role: "MENTOR" | "MENTEE",
    roomId: string,
    sessionExpiresAt: string,
    iceServers: Array<{ urls: string[] }>
}