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

  const [isScreenSharing, setIsScreenSharing] = useState(false) //me
  const [isPeerScreenSharing, setIsPeerScreenSharing] = useState(false) //peer

  const screenStreamRef = useRef<MediaStream | null>(null)
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null)
  const cameraEnabledRef = useRef(true)
  const isStoppingRef = useRef(false)
  const screenTrackRef = useRef<MediaStreamTrack | null>(null)

  async function initMedia() {
    if (localStreamRef.current) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

      const videoTrack = stream.getVideoTracks()[0]
      cameraTrackRef.current = videoTrack

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

    const handleScreenShareStart = () => {
      setIsPeerScreenSharing(true)
      console.log("Peer started screen sharing")
    }

    const handleScreenShareStop = () => {
      setIsPeerScreenSharing(false)
      console.log("Peer stopped screen sharing")
    }

    socket.on("webrtc:peer-joined", handlePeerJoined)
    socket.on("webrtc:offer", handleOffer)
    socket.on("webrtc:answer", handleAnswer)
    socket.on("webrtc:ice-candidate", handleIce)
    socket.on("webrtc:peer-left", handlePeerLeft)
    socket.on("webrtc:screen-share-started", handleScreenShareStart)
    socket.on("webrtc:screen-share-stopped", handleScreenShareStop)

    socket.on("webrtc:error", (error: any) => {
      console.error("WebRTC socket error:", error)
    })

    return () => {
      socket.off("webrtc:offer", handleOffer)
      socket.off("webrtc:answer", handleAnswer)
      socket.off("webrtc:ice-candidate", handleIce)
      socket.off("webrtc:peer-left", handlePeerLeft)
      socket.off("webrtc:peer-joined", handlePeerJoined)
      socket.off("webrtc:screen-share-started", handleScreenShareStart)
      socket.off("webrtc:screen-share-stopped", handleScreenShareStop)
      socket.off("webrtc:error")

      pc.close()
      pcRef.current = null
      pendingCandidates.current = []
    }

  }, [isJoined, isReady, role, sessionId, iceServers])

  function joinRoom(): void {
    if (!socket?.connected) {
      return
    }

    socket.emit("webrtc:join", { sessionId })
    setIsJoined(true)
  }

  function toggleMute(): void {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsMuted(prev => !prev)
  }

  function toggleCamera(): void {
    if (isScreenSharing) return

    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsCameraOff(prev => !prev)
  }

  function endCall(): void {
    localStreamRef.current?.getTracks().forEach(track => {
      track.stop()
    })

    screenStreamRef.current?.getTracks().forEach(track => track.stop())
    screenStreamRef.current = null

    setIsPeerScreenSharing(false)
    setIsScreenSharing(false)
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

  async function startScreenShare(): Promise<void> {
    if (!pcRef.current || connectionState !== "connected") {
      setError("Cannot start screen share: not connected")
      return
    }

    if (isScreenSharing) return

    setError(null)

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      const screenTrack = stream.getVideoTracks()[0]
      screenStreamRef.current = stream
      screenTrackRef.current = screenTrack
      screenTrack.onended = () => {
        stopScreenShare()
      }

      const camTrack = cameraTrackRef.current
      if (camTrack) {
        cameraEnabledRef.current = camTrack.enabled
      }

      const success = await replaceVideoTrack(screenTrack)
      if (!success) {
        socket?.emit("webrtc:screen-share-stopped", { sessionId })
        setError("Failed to start screen share")
        return
      }

      setIsScreenSharing(true)

      socket?.emit("webrtc:screen-share-started", { sessionId })

    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setError("Screen share permission denied. Please allow permissions in browser settings.")
      } else if (error.name == "NotReadableError") {
        setError("Screen share failed. Another application may be using screen capture.")
      } else {
        setError("Failed to start screen share: " + error.message)
      }
    }
  }

  async function replaceVideoTrack(newTrack: MediaStreamTrack): Promise<boolean> {
    const pc = pcRef.current

    if (!pc) return false

    const sender = pc.getSenders().find(s => s.track && s.track.kind === "video")

    if (!sender) {
      console.error("No video sender found")
      setError("Failed to replace video track: no sender found")
      return false
    }

    try {
      await sender.replaceTrack(newTrack)
      return true
    } catch (error: any) {
      console.error("Track replacement error:", error)
      setError("Failed to replace video track: " + error.message)
      return false
    }
  }

  async function stopScreenShare(): Promise<void> {
    if(!pcRef.current || connectionState !== "connected") {
      setError("Cannot stop screen share: not connected")
      return
    }

    if(isStoppingRef.current) return
    isStoppingRef.current = true

    const cameraTrack = cameraTrackRef.current

    if (!cameraTrack || cameraTrack.readyState === "ended") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        const newCameraTrack = stream.getVideoTracks()[0]

        cameraTrackRef.current = newCameraTrack
        localStreamRef.current = stream

        const success = await replaceVideoTrack(newCameraTrack)
        if (!success) {
          setError("Failed to recover camera")
          isStoppingRef.current = false
          return
        }

        setIsScreenSharing(false)
        socket?.emit("webrtc:screen-share-stopped", { sessionId })

      } catch (error: any) {
      if(error.name === "NotAllowedError") {
        setError("Camera access denied. Please allow permissions in browser settings.")
      } else if(error.name === "NotFoundError") {
        setError("No camera found on this device.")
      } else if(error.name === "NotReadableError") {
        setError("Camera is already in use by another application.")
      } else {
        setError("Failed to access camera: " + error.message)
      }
      }

      isStoppingRef.current = false
      return
    }

    cameraTrack.enabled = cameraEnabledRef.current

    const success = await replaceVideoTrack(cameraTrack)
    if (!success) {
      socket?.emit("webrtc:screen-share-stopped", { sessionId })
      setError("Failed to stop screen share")
      isStoppingRef.current = false
      return
    }

    if(screenTrackRef.current) {
      screenTrackRef.current.onended = null
      screenTrackRef.current.stop()
      screenTrackRef.current = null
    }

    screenStreamRef.current?.getTracks().forEach(track => track.stop())
    screenStreamRef.current = null

    setIsScreenSharing(false)

    socket?.emit("webrtc:screen-share-stopped", { sessionId })

    isStoppingRef.current = false
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
    endCall,
    startScreenShare,
    stopScreenShare,
    isScreenSharing,
    isPeerScreenSharing
  }
}