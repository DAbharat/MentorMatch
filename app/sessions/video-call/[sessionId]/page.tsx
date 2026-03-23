"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'
import InitialScreen from '@/components/video-call/InitialScreen'
import { Spinner } from '@/components/ui/spinner'
import { fetchSessionById } from '@/services/session.service'
import { io, Socket } from 'socket.io-client'
import { useWebRTC } from '@/hooks/useWebRTC'
import { startVideoCall } from '@/services/videocall.service'
import VideoCallScreen from '@/components/video-call/VideoCallScreen'


export default function VideoCallPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId

  const { user } = useUser()
  const { getToken } = useAuth()

  console.log("Frontend Clerk user:", user?.id);

  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [webrtcConfig, setWebrtcConfig] = useState<any>(null)
  const [role, setRole] = useState<"MENTOR" | "MENTEE" | null>(null)
  const socketInitializedRef = useRef(false)

  // Initialize socket with Clerk token - only once
  useEffect(() => {
    if (socketInitializedRef.current || !user?.id) return

    socketInitializedRef.current = true

    const initSocket = async () => {
      try {
        const token = await getToken({ skipCache: true })

        if (!token) {
          console.error("[Socket] ❌ No token obtained from Clerk")
          socketInitializedRef.current = false
          return
        }

        console.log("[Socket] ✅ Token obtained from Clerk")

        if (socketRef.current?.connected) {
          console.log("[Socket] Socket already connected, reusing")
          setSocket(socketRef.current)
          return
        }

        if (socketRef.current) {
          socketRef.current.disconnect()
        }

        console.log("[Socket] Initializing socket with token and sessionId:", sessionId)

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          transports: ["websocket", "polling"],
          auth: { token, sessionId },
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        // Add connection event handlers
        socketRef.current.on("connect", () => {
          console.log("[Socket] ✅ Connected to server, socket id:", socketRef.current?.id)
        })

        socketRef.current.on("connect_error", (error: any) => {
          console.error("[Socket] ❌ Connection error:", error.message)
          console.error("[Socket] Error data:", error)
        })

        socketRef.current.on("disconnect", (reason: string) => {
          console.log("[Socket] Disconnected. Reason:", reason)
          hasJoinedRef.current = false
        })

        socketRef.current.on("error", (error: any) => {
          console.error("[Socket] ❌ Socket error:", error)
        })

        setSocket(socketRef.current)
      } catch (error) {
        console.error("Failed to initialize socket:", error)
        socketInitializedRef.current = false
      }
    }

    initSocket()

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
      }
    }
  }, [user?.id, sessionId, getToken])

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isCameraOff,
    isPeerConnected,
    initMedia,
    toggleMute,
    toggleCamera,
    joinRoom,
    endCall
  } = useWebRTC({
    sessionId,
    role: (role || "MENTOR") as "MENTOR" | "MENTEE",
    iceServers: webrtcConfig?.iceServers || [],
    socket
  })

  const router = useRouter()

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<"INITIAL" | "IN CALL" | "CONNECTING" | "ENDED">("INITIAL")
  const [elapsed, setElapsed] = useState(0)
  const hasJoinedRef = useRef(false)

  // Timer for elapsed time
  useEffect(() => {
    if (phase === "IN CALL") {
      const interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [phase])

  // Initialize media on mount only
  useEffect(() => {
    console.log("[Page] Initializing media on component mount")
    console.log("[Page] initMedia function:", typeof initMedia)
    initMedia()
  }, [])

  // Load session data
  useEffect(() => {
    if (!sessionId) return

    const loadSession = async () => {
      try {
        const data = await fetchSessionById(sessionId)
        setSession(data.session)
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load session")
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId])

  // Setup when socket connects and session is loaded
  useEffect(() => {
    if (!socket || !session || !socket.connected) return

    const runSetup = async () => {
      if (session.status === "IN_PROGRESS") {
        setPhase("CONNECTING")
        try {
          const data = await startVideoCall(sessionId)
          setWebrtcConfig(data)
          setRole(data.role)
          console.log("[Page] WebRTC config received, role:", data.role)
          // Don't call joinRoom() here yet - let the next effect handle it

        } catch (error: any) {
          console.error("Error starting video call:", error)
          toast.error("Failed to start video call")
        }
      } else {
        setPhase("INITIAL")
      }
    }

    runSetup()
  }, [socket, session, sessionId])

  // Call joinRoom once config is ready
  useEffect(() => {
    if (!webrtcConfig || !socket?.connected || hasJoinedRef.current) return

    console.log("[Page] ✅ Calling joinRoom() - config ready and socket connected")
    hasJoinedRef.current = true
    joinRoom()
  }, [webrtcConfig, socket, sessionId, joinRoom])

  // Handle WebRTC connection state changes
  useEffect(() => {
    if (connectionState === "connecting" || connectionState === "new") {
      setPhase("CONNECTING")
    } else if (connectionState === "connected") {
      setPhase("IN CALL")
    } else if (connectionState === "failed" || connectionState === "disconnected") {
      setPhase("CONNECTING")
      hasJoinedRef.current = false
      // Try to rejoin after reconnection
      if (socket?.connected) {
        console.log("[Reconnect] Attempting to rejoin after connection failure")
        socket.emit("webrtc:join", { sessionId })
        hasJoinedRef.current = true
      }
    }
  }, [connectionState, socket, sessionId])

  const formattedTime = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0")}:${(elapsed % 60)
      .toString()
      .padStart(2, "0")}`

  const handleToggleMic = () => {
    toggleMute()
  }

  const handleToggleCamera = () => {
    toggleCamera()
  }

  const handleJoinCall = async () => {
    setPhase("CONNECTING")
    hasJoinedRef.current = false
    try {
      const data = await startVideoCall(sessionId)
      setWebrtcConfig(data)
      setRole(data.role)
      
      // Emit webrtc:join directly - socket connect handler will also do this
      if (socket?.connected) {
        console.log("✅ Manual join: Emitting webrtc:join for sessionId:", sessionId)
        socket.emit("webrtc:join", { sessionId })
        hasJoinedRef.current = true
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join video call")
      console.error("Error joining video call:", error)
      setPhase("INITIAL")
    }
  }

  const handleEndCall = async () => {
    setPhase("ENDED")
    endCall()
    hasJoinedRef.current = false
    router.push("/sessions")
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b090a]">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b090a]">
        <p className="text-red-500">Session not found</p>
      </div>
    )
  }

  if (phase === "CONNECTING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b090a]">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-2">
            Connecting...
          </p>
          <p className="text-[#666] text-sm">
            Setting up secure video connection
          </p>
        </div>
      </div>
    )
  }

  return (phase === "INITIAL" ?
    <div className="bg-[#0b090a] min-h-screen">
      <InitialScreen
        id={session.id}
        mentor={session.mentor}
        mentee={session.mentee}
        micEnabled={!isMuted}
        cameraEnabled={!isCameraOff}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onJoinCall={handleJoinCall}
        localStream={localStream}
      />
    </div> :
    <div className="bg-[#0b090a] min-h-screen">
      <VideoCallScreen
        sessionId={session.id}
        mentor={session.mentor}
        mentee={session.mentee}
        localStream={localStream}
        remoteStream={remoteStream}
        micEnabled={!isMuted}
        cameraEnabled={!isCameraOff}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onEndCall={handleEndCall}
        isUserMentor={role === "MENTOR"}
        elapsedTime={formattedTime}
        connectionState={connectionState}
        isPeerConnected={isPeerConnected}
        isReconnected={false}
      />
    </div>
  )
}

