"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import InitialScreen from '@/components/video-call/InitialScreen'
import { Spinner } from '@/components/ui/spinner'
import { fetchSessionById } from '@/services/session.service'

export default function VideoCallPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)

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

  const handleToggleMic = () => {
    setMicEnabled(!micEnabled)
  }

  const handleToggleCamera = () => {
    setCameraEnabled(!cameraEnabled)
  }

  const handleJoinCall = () => {
    // Join functionality to be implemented
    console.log("Join call clicked")
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

  return (
    <div className="bg-[#0b090a] min-h-screen">
      <InitialScreen
        id={session.id}
        mentor={session.mentor}
        mentee={session.mentee}
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onJoinCall={handleJoinCall}
      />
    </div>
  )
}

