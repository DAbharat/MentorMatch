"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const socketRef = useRef<Socket | null>(null)

  if (!socketRef.current) {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!)
  }
  const socket = socketRef.current
  const [webrtcConfig, setWebrtcConfig] = useState<any>(null)

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
    role: "MENTOR",
    iceServers: webrtcConfig?.iceServers || [],
    socket
  })

  const router = useRouter()

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<"INITIAL" | "IN CALL" | "CONNECTING" | "ENDED">("INITIAL")
  const [elapsed, setElapsed] = useState(0)

  const hasJoinedRef = useRef(false)

  const safeJoin = () => {
    if (hasJoinedRef.current) return
    if(!socket?.connected) return

    hasJoinedRef.current = true
    joinRoom()
  }

  useEffect(() => {
    if (phase === "IN CALL") return

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    initMedia()
  }, [])

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

  useEffect(() => {
    if (!session) return

    const setup = async () => {
      await initMedia()

      if (session.status === "IN_PROGRESS") {
        console.log("Rejoining active session")
        setPhase("CONNECTING")

        const data = await startVideoCall(sessionId)
        setWebrtcConfig(data)

        safeJoin()
      }
    }

    setup()
  }, [session])

  useEffect(() => {
  if (!socket) return

  if (connectionState === "connecting" || connectionState === "new") {
    setPhase("CONNECTING")
  }

  if (connectionState === "connected") {
    setPhase("IN CALL")
  }

  if (connectionState === "failed" || connectionState === "disconnected") {
    console.log("Connection failed, retrying...")
    setPhase("CONNECTING")
    hasJoinedRef.current = false
    safeJoin() 
  }

}, [connectionState])

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
    try {
      const data = await startVideoCall(sessionId)

      setWebrtcConfig(data)
      safeJoin()

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
        isUserMentor={true}
        elapsedTime={formattedTime}
        connectionState={connectionState}
        isPeerConnected={isPeerConnected}
      />
    </div>
  )
}

