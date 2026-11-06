export interface WsClientOptions {
    token?: string;
    chatId?: string;
    sessionId?: string;
    reconnectAttempts?: number;
    reconnectDelay?: number;
}

type EventCallback = (...args: any[]) => void;

export class WsClient {
    private ws: WebSocket | null = null;
    private url: string;
    private options: WsClientOptions;
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private reconnectCount = 0;
    private reconnectTimer: any = null;
    private shouldReconnect = true;

    private joinedRooms : Set<string> = new Set();

    public connected = false;

    constructor(baseUrl: string, options: WsClientOptions = {}) {
        this.options = {
            reconnectAttempts: 5,
            reconnectDelay: 1000,
            ...options,
        }

        if(options.chatId) {
            this.joinedRooms.add(`chat_${options.chatId}`)
        }
        if(options.sessionId) {
            this.joinedRooms.add(`call_${options.sessionId}`)
        }

        let wsUrl = baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:")
        if (!wsUrl.endsWith("/ws")) {
            wsUrl = wsUrl.replace(/\/+$/, "") + "/ws"
        }

        const params = new URLSearchParams()
        if(this.options.token) params.set("token", this.options.token)
        if(this.options.chatId) params.set("chatId", this.options.chatId)
        if(this.options.sessionId) params.set("sessionId", this.options.sessionId)

        const query = params.toString()
        this.url = query ? `${wsUrl}?${query}` : wsUrl

        this.connect()
    }

    public connect(): void {
        if(this.ws && this.ws.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            this.ws = new WebSocket(this.url)

            this.ws.onopen = () => {
                this.connected = true;
                const isReconnect = this.reconnectCount > 0;
                this.reconnectCount = 0;

                this.restoreRooms();

                this.dispatch(isReconnect ? "reconnect" : "connect");
            }

            this.ws.onmessage = (event: MessageEvent) => {
                try {
                    const payload = JSON.parse(event.data)
                    if(payload && payload.event) {
                        this.dispatch(payload.event, payload.data ?? payload)
                    }
                } catch (error) {
                    console.error("[WsClient] Failed to parse message: ", event.data, error)
                }
            }

            this.ws.onerror = (error) => {
                this.dispatch("error", error)
                this.dispatch("connect_error", error)
            }

            this.ws.onclose = (event) => {
                this.connected = false
                this.dispatch("disconnect", event.reason || "closed")

                if(this.shouldReconnect && this.reconnectCount < (this.options.reconnectAttempts || 5)) {
                    this.reconnectCount++;
                    const delay = (this.options.reconnectDelay || 1000) * Math.min(this.reconnectCount, 5)
                    this.reconnectTimer = setTimeout(() => this.connect(), delay)
                }
            }
        } catch (error) {
            this.dispatch("connect_error: ", error)
        }
    }

    public joinRoom(room: string): void {
        this.joinedRooms.add(room);
        if(this.connected) {
            this.emit("join_room", {room})
        }
    }

    public leaveRoom(room: string): void {
        this.joinedRooms.delete(room)
        if(this.connected) {
            this.emit("leave_room", {room})
        }
    }

    private restoreRooms(): void {
        for(const room of this.joinedRooms) {
            if(room.startsWith("call_")) {
                const sessionId = room.replace("call_", "")
                this.emit("webrtc:join", {sessionId})
            } else {
                this.emit("join_room", {room})
            }
        }
    }

    public on(event: string, callback: EventCallback): this {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event)!.add(callback)
        return this;
    }

    public off(event: string, callback?: EventCallback): this {
        if(!callback) {
            this.listeners.delete(event)
        } else {
            this.listeners.get(event)?.delete(callback)
        }
        return this;
    }

    public emit(event: string, data: any = {}): this {
        if(!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn(`[WsClient] Cannot emit '${event}': Websocket is not open`)
            return this;
        }

        let room = ""
        if(data?.chatId || this.options.chatId) {
            room = `chat_${data.chatId || this.options.chatId}`
        } else {
            room = `call_${data?.sessionId || this.options.sessionId}`
        }

        const payload = {
            event, room, data: data ?? {}
        }

        this.ws.send(JSON.stringify(payload))
        return this;
    }

    public disconnect(): void {
        this.shouldReconnect = false;
        clearTimeout(this.reconnectTimer)
        if(this.ws) {
            this.ws.close(1000, "Client disconnected")
            this.ws = null
        }
        this.connected = false
        this.listeners.clear()
    }

    private dispatch(event: string, ...args: any[]): void {
        const cbs = this.listeners.get(event)
        if(cbs) {
            cbs.forEach((cb) => {
                try {
                    cb(...args)
                } catch(error) {
                    console.error(`[WsClient] Error in listener for '${event}': `, error)
                }
            })
        }
    }
}