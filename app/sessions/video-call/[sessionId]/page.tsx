"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { refresh } from '@/services/account.service'
import { toast } from 'sonner'
import InitialScreen from '@/components/video-call/InitialScreen'
import { Spinner } from '@/components/ui/spinner'
import { completeSession, fetchSessionById } from '@/services/session.service'
import { io, Socket } from 'socket.io-client'
import { useWebRTC } from '@/hooks/useWebRTC'
import { startVideoCall } from '@/services/videocall.service'
import VideoCallScreen from '@/components/video-call/VideoCallScreen'


export default function VideoCallPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  const router = useRouter()

  const { userId } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [webrtcConfig, setWebrtcConfig] = useState<any>(null)
  const [role, setRole] = useState<"MENTOR" | "MENTEE" | null>(null)
  const socketInitializedRef = useRef(false)

  // Refresh token and get a fresh one before socket connection
  useEffect(() => {
    const refreshAndSetToken = async () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        if (!storedToken) {
          router.push("/sign-in")
          return
        }

        const newToken = await refresh()
        if (newToken) {
          localStorage.setItem('authToken', newToken)
          setToken(newToken)
        } else {
          toast.error("Failed to retrieve authentication token")
        }
      } catch (error) {
        console.error("Failed to refresh token:", error)
        router.push("/sign-in")
      }
    }

    if (typeof window !== 'undefined' && userId) {
      refreshAndSetToken()
    }
  }, [userId, router])

  useEffect(() => {
    if (userId) {
      // User loaded
    }
  }, [userId])

  useEffect(() => {
    if (socketInitializedRef.current || !userId || !token) return

    socketInitializedRef.current = true

    const initSocket = async () => {
      try {
        if (socketRef.current?.connected) {
          setSocket(socketRef.current)
          return
        }

        if (socketRef.current) {
          socketRef.current.disconnect()
        }

        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          transports: ["websocket", "polling"],
          auth: { token, sessionId },
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        socketRef.current.on("connect", () => {
          console.log("Socket connected.")
        })

        socketRef.current.on("connect_error", (error: any) => {
          console.log("Socket connection error: ", error.message)
          toast.error("Failed to connect to Server.")
        })

        socketRef.current.on("disconnect", (reason: string) => {
          console.warn("Diconnected: ", reason)
          hasJoinedRef.current = false

          if (reason === "io server disconnect") {
            socketRef.current?.connect
          }
        })

        socketRef.current.on("error", (error: any) => {
          console.error("Error: ", error.message)
        })

        setSocket(socketRef.current)
      } catch (error) {
        socketInitializedRef.current = false
      }
    }

    initSocket()

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
      }
    }
  }, [userId, sessionId, token])

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
    endCall,
    startScreenShare,
    stopScreenShare,
    isScreenSharing,
    isPeerScreenSharing,
  } = useWebRTC({
    sessionId,
    role: (role || "MENTOR") as "MENTOR" | "MENTEE",
    iceServers: webrtcConfig?.iceServers || [],
    socket
  })

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<"INITIAL" | "IN CALL" | "CONNECTING" | "ENDED">("INITIAL")
  const [elapsed, setElapsed] = useState(0)
  const [isRejoin, setIsRejoin] = useState(false)

  const hasJoinedRef = useRef(false)
  const rejoinStartedRef = useRef(false)
  const joinAttemptedRef = useRef(false)

  // Timer for elapsed time based on actual session start time
  useEffect(() => {
    if (phase === "IN CALL" && session?.callStartedAt) {
      // Calculate initial elapsed time from when session actually started
      const startTime = new Date(session.callStartedAt).getTime()
      const now = new Date().getTime()
      const initialElapsed = Math.floor((now - startTime) / 1000)
      setElapsed(initialElapsed)

      const interval = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [phase, session?.callStartedAt])

  useEffect(() => {
    initMedia()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const searchParams = new URLSearchParams(window.location.search)
    const rejoinParam = searchParams.get('rejoin') === 'true'
    setIsRejoin(rejoinParam)
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

  // Setup when socket connects and session is loaded - always show initial screen first
  useEffect(() => {
    if (!socket || !session || !socket.connected) return

    const handleSessionStarted = async (data: any) => {
      if (data.callStartedAt) {
        setSession((prev: any) => ({
          ...prev,
          callStartedAt: data.callStartedAt
        }))
      } else {
        try {
          const updatedData = await fetchSessionById(sessionId)
          setSession(updatedData.session)
        } catch (error) {
          // Failed to refetch session
        }
      }
    }

    socket.on("session:started", handleSessionStarted)

    return () => {
      socket.off("session:started", handleSessionStarted)
    }
  }, [socket, sessionId])

  // Handle rejoin auto-join - separate effect to prevent infinite loop
  useEffect(() => {
    if (!socket || !session || !socket.connected || !isRejoin) return
    if (rejoinStartedRef.current) return

    rejoinStartedRef.current = true

    const autoJoin = async () => {
      try {
        const data = await startVideoCall(sessionId)
        setWebrtcConfig(data)
        setRole(data.role)

        try {
          const sessionData = await fetchSessionById(sessionId)
          setSession(sessionData.session)
        } catch (error) {
          // Failed to refetch session
        }

        if (socket?.connected) {
          socket.emit("session:start", { sessionId })
        }
      } catch (error: any) {
        toast.error("Failed to rejoin session")
        setPhase("INITIAL")
        rejoinStartedRef.current = false
      }
    }

    autoJoin()
  }, [socket, sessionId, isRejoin])

  // Show initial screen if not rejoin and not attempting to join
  useEffect(() => {
    if (isRejoin || rejoinStartedRef.current || joinAttemptedRef.current) return
    if (!socket || !session || !socket.connected) return

    setPhase("INITIAL")
  }, [socket, session, isRejoin])

  useEffect(() => {
    if (!webrtcConfig || !socket?.connected || hasJoinedRef.current) return

    hasJoinedRef.current = true
    joinRoom()
  }, [webrtcConfig, socket, sessionId, joinRoom])

  useEffect(() => {
    if (!webrtcConfig) return

    if (connectionState === "connecting" || connectionState === "new") {
      setPhase("CONNECTING")
    } else if (connectionState === "connected") {
      setPhase("IN CALL")
    } else if (connectionState === "failed" || connectionState === "disconnected") {
      setPhase("CONNECTING")
      hasJoinedRef.current = false
      if (socket?.connected) {
        socket.emit("webrtc:join", { sessionId })
        hasJoinedRef.current = true
      }
    }
  }, [connectionState, socket, sessionId, webrtcConfig])

  const formattedTime = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0")}:${(elapsed % 60)
      .toString()
      .padStart(2, "0")}`

  const handleToggleMic = useCallback(() => {
    toggleMute()
  }, [toggleMute])

  const handleToggleCamera = useCallback(() => {
    toggleCamera()
  }, [toggleCamera])

  const handleJoinCall = useCallback(async () => {
    joinAttemptedRef.current = true
    setPhase("CONNECTING")
    hasJoinedRef.current = false
    try {
      const data = await startVideoCall(sessionId)
      setWebrtcConfig(data)
      setRole(data.role)

      try {
        const sessionData = await fetchSessionById(sessionId)
        setSession(sessionData.session)
      } catch (error: any) {
        console.error("Failed to refetch session after starting call:", error.message)
      }

      if (socket?.connected) {
        socket.emit("session:start", { sessionId })
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join video call")
      setPhase("INITIAL")
      joinAttemptedRef.current = false
    }
  }, [sessionId, socket])

  const handleAutoEndCall = useCallback(async () => {
    setPhase("ENDED")
    endCall()
    hasJoinedRef.current = false

    try {
      await completeSession(sessionId, true)
      toast.success("Session auto-ended due to time limit")
    } catch (error) {
      console.error("Failed to auto-end session:", error)
    }

    router.push("/sessions")
  }, [sessionId, endCall, router])

  const handleEndCall = useCallback(async () => {
    setPhase("ENDED")
    endCall()
    hasJoinedRef.current = false
    router.push("/sessions")
  }, [endCall, router])

  useEffect(() => {
    if (phase === "IN CALL" && session?.totalCallDuration) {
      const sessionDurationSeconds = session.totalCallDuration * 60

      if (elapsed >= sessionDurationSeconds) {
        toast.info("Session time limit reached. Ending call...")
        handleAutoEndCall()
        toast.success("Call ended")
      }
    }
  }, [elapsed, phase, session?.totalCallDuration, handleAutoEndCall])

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
        isScreenSharing={isScreenSharing}
        isPeerScreenSharing={isPeerScreenSharing}
        onStartScreenShare={startScreenShare}
        onStopScreenShare={stopScreenShare}
      />
    </div>
  )
}

