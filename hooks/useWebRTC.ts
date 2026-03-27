import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"

interface useWebRTCProps {
  sessionId: string
  role: "MENTOR" | "MENTEE"
  iceServers: RTCIceServer[]
  socket: Socket | null
}

export const useWebRTC = ({
  sessionId,
  role,
  iceServers,
  socket
}: useWebRTCProps) => {

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pendingCandidates = useRef<RTCIceCandidate[]>([])

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new")

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isPeerConnected, setIsPeerConnected] = useState(false)

  async function initMedia() {
    if (localStreamRef.current) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

      localStreamRef.current = stream
      setLocalStream(stream)
      setIsReady(true)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError("Camera/mic access denied. Please allow permissions in browser settings.")
      } else if (err.name === 'NotFoundError') {
        setError("No camera or microphone found on this device.")
      } else if (err.name === 'NotReadableError') {
        setError("Camera/mic is already in use by another application.")
      } else {
        setError("Failed to access camera/mic: " + err.message)
      }
    }
  }

  function createPeerConnection() {
    const pc = new RTCPeerConnection({ iceServers })

    if (!localStreamRef.current) {
      return pc
    }

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!)
    })

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        socket.emit("webrtc:ice-candidate", {
          sessionId,
          candidate: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState)

      if (pc.connectionState === "connected") {
        setIsPeerConnected(true)
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setIsPeerConnected(false)
      }
    }

    pcRef.current = pc
    return pc
  }

  useEffect(() => {
    if (!socket || !isJoined || !isReady) {
      return
    }

    const pc = createPeerConnection()

    const createOffer = async () => {
      if (role !== "MENTOR") {
        return
      }

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit("webrtc:offer", { sessionId, offer })
      } catch (err) {
        console.error("Offer error:", err)
      }
    }

    const handlePeerJoined = async () => {
      if (role !== "MENTOR") {
        return
      }

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit("webrtc:offer", { sessionId, offer })
      } catch (err) {
        console.error("Peer joined offer error:", err)
      }
    }


    const handleOffer = async ({ offer }: any) => {
      if (role !== "MENTEE") {
        return
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit("webrtc:answer", { sessionId, answer })

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(c)
        }
        pendingCandidates.current = []
      } catch (err) {
        console.error("Offer handling error:", err)
      }
    }

    const handleAnswer = async ({ answer }: any) => {
      if (role !== "MENTOR") {
        return
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(c)
        }
        pendingCandidates.current = []
      } catch (err) {
        console.error("Answer handling error:", err)
      }
    }

    const handleIce = async ({ candidate }: any) => {
      const ice = new RTCIceCandidate(candidate)

      if (!pc.remoteDescription) {
        pendingCandidates.current.push(ice)
        return
      }

      try {
        await pc.addIceCandidate(ice)
      } catch (err) {
        console.error("ICE error:", err)
      }
    }

    const handlePeerLeft = () => {
      setRemoteStream(null)
      setIsPeerConnected(false)
    }

    socket.on("webrtc:peer-joined", handlePeerJoined)
    socket.on("webrtc:offer", handleOffer)
    socket.on("webrtc:answer", handleAnswer)
    socket.on("webrtc:ice-candidate", handleIce)
    socket.on("webrtc:peer-left", handlePeerLeft)
    
    socket.on("webrtc:error", (error: any) => {
      console.error("WebRTC socket error:", error)
    })

    return () => {
      socket.off("webrtc:offer", handleOffer)
      socket.off("webrtc:answer", handleAnswer)
      socket.off("webrtc:ice-candidate", handleIce)
      socket.off("webrtc:peer-left", handlePeerLeft)
      socket.off("webrtc:peer-joined", handlePeerJoined)
      socket.off("webrtc:error")

      pc.close()
      pcRef.current = null
      pendingCandidates.current = []
    }

  }, [isJoined, isReady, role, sessionId, iceServers])

  function joinRoom() {
    if (!socket?.connected) {
      return
    }

    socket.emit("webrtc:join", { sessionId })
    setIsJoined(true)
  }

  function toggleMute() {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsMuted(prev => !prev)
  }

  function toggleCamera() {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsCameraOff(prev => !prev)
  }

  function endCall() {
    localStreamRef.current?.getTracks().forEach(track => {
      track.stop()
    })
    pcRef.current?.close()
    socket?.emit("webrtc:leave", { sessionId })

    setLocalStream(null)
    setRemoteStream(null)
    setConnectionState("closed")
    setIsJoined(false)
    setIsReady(false)

    pcRef.current = null
    localStreamRef.current = null
    console.log("[WebRTC] Call state reset")
  }

  return {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isCameraOff,
    isReady,
    error,
    isPeerConnected,
    initMedia,
    joinRoom,
    toggleMute,
    toggleCamera,
    endCall
  }
}