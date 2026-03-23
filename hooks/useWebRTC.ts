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
    console.log("[WebRTC] initMedia called")
    if (localStreamRef.current) {
      console.log("[WebRTC] Media already initialized, skipping")
      return
    }

    try {
      console.log("[WebRTC] Requesting media devices...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

      console.log("[WebRTC] Media stream obtained:", stream)
      localStreamRef.current = stream
      setLocalStream(stream)
      setIsReady(true)
      console.log("[WebRTC] isReady set to true")
    } catch (err: any) {
      console.error("[WebRTC] Media error - Name:", err.name, "Message:", err.message)
      console.error("[WebRTC] Full error:", err)
      
      // More specific error messages
      if (err.name === 'NotAllowedError') {
        console.error("[WebRTC] Permission denied - user rejected camera/mic access")
        setError("Camera/mic access denied. Please allow permissions in browser settings.")
      } else if (err.name === 'NotFoundError') {
        console.error("[WebRTC] No camera/mic device found")
        setError("No camera or microphone found on this device.")
      } else if (err.name === 'NotReadableError') {
        console.error("[WebRTC] Camera/mic is in use by another app")
        setError("Camera/mic is already in use by another application.")
      } else {
        setError("Failed to access camera/mic: " + err.message)
      }
    }
  }

  function createPeerConnection() {
    console.log("[WebRTC] Creating peer connection with ICE servers:", iceServers)
    const pc = new RTCPeerConnection({ iceServers })

    if (!localStreamRef.current) {
      console.warn("[WebRTC] localStreamRef.current is null!")
      return pc
    }

    localStreamRef.current.getTracks().forEach(track => {
      console.log("[WebRTC] Adding track:", track.kind)
      pc.addTrack(track, localStreamRef.current!)
    })

    pc.ontrack = (event) => {
      console.log("[WebRTC] ontrack event:", event)
      setRemoteStream(event.streams[0])
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        console.log("[WebRTC] Sending ICE candidate")
        socket.emit("webrtc:ice-candidate", {
          sessionId,
          candidate: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state changed to:", pc.connectionState)
      setConnectionState(pc.connectionState)

      if (pc.connectionState === "connected") {
        console.log("[WebRTC] Peer connection established!")
        setIsPeerConnected(true)
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        console.log("[WebRTC] Peer connection lost")
        setIsPeerConnected(false)
      }
    }

    pcRef.current = pc
    return pc
  }

  useEffect(() => {
    console.log("[WebRTC] Effect triggered - socket:", !!socket, "isJoined:", isJoined, "isReady:", isReady, "role:", role)
    
    if (!socket || !isJoined || !isReady) {
      console.log("[WebRTC] Skipping effect - missing condition. socket:", !!socket, "isJoined:", isJoined, "isReady:", isReady)
      return
    }

    console.log("Starting WebRTC as:", role)

    const pc = createPeerConnection()

    const createOffer = async () => {
      console.log("[WebRTC] createOffer called - role:", role)
      if (role !== "MENTOR") {
        console.log("[WebRTC] Not MENTOR, skipping offer creation")
        return
      }

      try {
        console.log("[WebRTC] Creating initial offer...")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("webrtc:offer", { sessionId, offer })
        console.log("[WebRTC] Initial offer sent")
      } catch (err) {
        console.error("[WebRTC] Initial offer error:", err)
      }
    }

    const handlePeerJoined = async () => {
      console.log("[WebRTC] handlePeerJoined - role:", role)

      if (role !== "MENTOR") {
        console.log("[WebRTC] Not MENTOR, skipping offer creation")
        return
      }

      try {
        console.log("[WebRTC] Creating offer after peer joined...")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("webrtc:offer", { sessionId, offer })
        console.log("[WebRTC] Offer sent after peer joined")
      } catch (err) {
        console.error("[WebRTC] Offer error after peer joined:", err)
      }
    }


    const handleOffer = async ({ offer }: any) => {
      console.log("[WebRTC] handleOffer received - role:", role)

      if (role !== "MENTEE") {
        console.log("[WebRTC] Not MENTEE, ignoring offer")
        return
      }

      console.log("[WebRTC] Processing offer as MENTEE...")

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.emit("webrtc:answer", { sessionId, answer })
        console.log("[WebRTC] Answer sent")

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(c)
        }
        pendingCandidates.current = []

      } catch (err) {
        console.error("[WebRTC] Offer handling failed:", err)
      }
    }

    const handleAnswer = async ({ answer }: any) => {
      console.log("[WebRTC] handleAnswer received - role:", role)

      if (role !== "MENTOR") {
        console.log("[WebRTC] Not MENTOR, ignoring answer")
        return
      }

      console.log("[WebRTC] Processing answer as MENTOR...")

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(c)
        }
        pendingCandidates.current = []

        console.log("[WebRTC] Answer processed successfully")

      } catch (err) {
        console.error("[WebRTC] Answer handling failed:", err)
      }
    }

    const handleIce = async ({ candidate }: any) => {
      console.log("[WebRTC] ICE candidate received")
      const ice = new RTCIceCandidate(candidate)

      if (!pc.remoteDescription) {
        console.log("[WebRTC] No remote description yet, queuing ICE candidate")
        pendingCandidates.current.push(ice)
        return
      }

      try {
        await pc.addIceCandidate(ice)
        console.log("[WebRTC] ICE candidate added")
      } catch (err) {
        console.error("[WebRTC] ICE failed:", err)
      }
    }

    const handlePeerLeft = () => {
      console.log("[WebRTC] Peer left")
      setRemoteStream(null)
      setIsPeerConnected(false)
    }

    socket.on("webrtc:peer-joined", handlePeerJoined)
    socket.on("webrtc:offer", handleOffer)
    socket.on("webrtc:answer", handleAnswer)
    socket.on("webrtc:ice-candidate", handleIce)
    socket.on("webrtc:peer-left", handlePeerLeft)
    
    socket.on("webrtc:error", (error: any) => {
      console.error("[WebRTC] Socket error detail:", {
        message: error.message,
        details: error.details,
        fullError: error
      })
    })

    console.log("[WebRTC] Socket event listeners registered")
    console.log("[WebRTC] Listening for: webrtc:peer-joined, webrtc:offer, webrtc:answer, webrtc:ice-candidate, webrtc:peer-left")

    // Test if socket is actually connected
    console.log("[WebRTC] Socket ID:", socket.id, "Socket connected:", socket.connected)

    // MENTOR creates initial offer immediately
    // if (role === "MENTOR") {
    //   console.log("[WebRTC] MENTOR: Creating initial offer after setup")
    //   createOffer()
    // } else {
    //   console.log("[WebRTC] MENTEE: Waiting for offer from MENTOR...")
    // }

    return () => {
      console.log("[WebRTC] Cleaning up peer connection and event listeners")
      socket.off("webrtc:offer", handleOffer)
      socket.off("webrtc:answer", handleAnswer)
      socket.off("webrtc:ice-candidate", handleIce)
      socket.off("webrtc:peer-left", handlePeerLeft)
      socket.off("webrtc:peer-joined", handlePeerJoined)
      socket.off("webrtc:error", (error: any) => {
        console.error("[WebRTC] Socket error detail:", {
          message: error.message,
          details: error.details,
          fullError: error,
          type: "VALIDATION_ERROR"
        })
        console.log("FULL ERROR:", error)
      })


      pc.close()
      pcRef.current = null
      pendingCandidates.current = []
    }

  }, [socket, isJoined, isReady, role, sessionId, iceServers])

  function joinRoom() {
    console.log("[WebRTC] joinRoom called - socket connected:", socket?.connected)
    if (!socket?.connected) {
      console.log("[WebRTC] Socket not connected, cannot join")
      return
    }

    console.log("[WebRTC] Emitting webrtc:join for sessionId:", sessionId)
    socket.emit("webrtc:join", { sessionId })
    setIsJoined(true)
    console.log("[WebRTC] isJoined set to true")
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
    console.log("[WebRTC] endCall triggered")
    
    localStreamRef.current?.getTracks().forEach(track => {
      console.log("[WebRTC] Stopping track:", track.kind)
      track.stop()
    })
    pcRef.current?.close()

    socket?.emit("webrtc:leave", { sessionId })
    console.log("[WebRTC] webrtc:leave emitted")

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