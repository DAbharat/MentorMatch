import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface useWebRTCProps {
    sessionId: string;
    role: "MENTOR" | "MENTEE";
    iceServers: RTCIceServer[];
    socket: Socket | null;
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
    const [isReconnected, setIsReconnected] = useState(false)

    const hasConnectedOnceRef = useRef(false)

    async function initMedia() {

        if (localStreamRef.current) return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            })

            localStreamRef.current = stream
            setLocalStream(stream)
            setIsReady(true)

        } catch (err: any) {
            const errorMessage = getMediaErrorMessage(err)
            console.error("Failed to access media devices:", err)
            setError(errorMessage)
        }
    }

    function getMediaErrorMessage(error: any): string {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            return "Permission denied. Please allow access to camera and microphone."
        }
        if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
            return "No camera or microphone found on this device."
        }
        if (error.name === "NotReadableError" || error.name === "TrackStartError") {
            return "Camera or microphone is already in use by another application."
        }
        if (error.name === "TypeError") {
            return "MediaDevices API not supported in this browser."
        }
        return "Failed to access media devices. Please check your permissions and try again."
    }

    function createPeerConnection() {

        if (pcRef.current) return pcRef.current

        const pc = new RTCPeerConnection({ iceServers })

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!)
            })
        }

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0])
        }

        pc.onicecandidate = (event) => {

            if (!socket || !socket.connected) return

            if (event.candidate) {
                socket.emit("webrtc:ice-candidate", {
                    sessionId,
                    candidate: event.candidate
                })
            }
        }

        pc.onconnectionstatechange = () => {
            setConnectionState(pc.connectionState)

            if(pc.connectionState === "connected") {
                setIsPeerConnected(true)

                if(hasConnectedOnceRef.current) {
                    console.log("Peer reconnected")
                    setIsReconnected(true)
                } else {
                    hasConnectedOnceRef.current = true
                }
            }

            if(pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
                setIsPeerConnected(false)
                setIsReconnected(false)
            }
        }

        pcRef.current = pc
        return pc
    }

    useEffect(() => {

        if (!socket || !isJoined || !isReady) return

        if (!socket.connected) return

        pcRef.current?.close()
        pcRef.current = null

        const pc = createPeerConnection()

        socket.emit("webrtc:join", { sessionId })

        const retryJoin = async () => {
            console.log("Reconnecting...")

            pcRef.current?.close()
            pcRef.current = null

            const pc = createPeerConnection()
            socket.emit("webrtc:join", { sessionId })

            if (role === "MENTOR" && pc.signalingState === "stable") {
                try {
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)

                    socket.emit("webrtc:offer", { sessionId, offer })
                } catch (error) {
                    console.error("Error creating offer:", error)
                }
            }
        }

        const handlePeerJoined = async () => {

            if (role !== "MENTOR") return
            if (pc.signalingState !== "stable") return

            try {

                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)

                socket.emit("webrtc:offer", { sessionId, offer })

            } catch (err) {
                console.error(err || "Failed to create offer")
            }
        }

        const handleOffer = async ({ offer }: any) => {

            if (role !== "MENTEE") return

            try {

                await pc.setRemoteDescription(new RTCSessionDescription(offer))

                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)

                socket.emit("webrtc:answer", { sessionId, answer })

                for (const candidate of pendingCandidates.current) {
                    await pc.addIceCandidate(candidate)
                }

                pendingCandidates.current = []

            } catch (err) {
                console.error(err || "Failed to handle offer")
                setError("Failed to establish connection. Please try again.")
            }
        }

        const handleAnswer = async ({ answer }: any) => {

            if (pc.signalingState !== "have-local-offer") return

            if (role !== "MENTOR") return

            try {

                await pc.setRemoteDescription(new RTCSessionDescription(answer))

                for (const candidate of pendingCandidates.current) {
                    await pc.addIceCandidate(candidate)
                }

                pendingCandidates.current = []

            } catch (err) {
                console.error(err || "Failed to handle answer")
                setError("Failed to establish connection. Please try again.")
            }
        }

        const handleIceCandidate = async ({ candidate }: any) => {

            const ice = new RTCIceCandidate(candidate)

            if (!pc.remoteDescription) {
                pendingCandidates.current.push(ice)
                return
            }

            try {
                await pc.addIceCandidate(ice)
            } catch (err) {
                console.error(err || "Failed to add ICE candidate")
                setError("Failed to establish connection. Please try again.")
            }
        }

        const handlePeerLeft = () => {
            setRemoteStream(null)
            setConnectionState("disconnected")
            setIsPeerConnected(false)

            console.log("Peer left, waiting for them to reconnect...")
        }

        const handleError = ({ message, details }: any) => {
            setError(`${message}: ${details}`)
        }

        const handleConnect = () => {
            console.log("Socket connected, joining room...")

            if (isJoined) {
                retryJoin()
            }
        }

        socket.on("connect", handleConnect)

        socket.on("webrtc:peer-joined", handlePeerJoined)
        socket.on("webrtc:offer", handleOffer)
        socket.on("webrtc:answer", handleAnswer)
        socket.on("webrtc:ice-candidate", handleIceCandidate)
        socket.on("webrtc:peer-left", handlePeerLeft)
        socket.on("webrtc:error", handleError)
        socket.on("disconnect", () => {
            console.log("Socket disconnected")
            setIsPeerConnected(false)
        })

        return () => {

            socket.off("connect", handleConnect)
            socket.off("webrtc:peer-joined", handlePeerJoined)
            socket.off("webrtc:offer", handleOffer)
            socket.off("webrtc:answer", handleAnswer)
            socket.off("webrtc:ice-candidate", handleIceCandidate)
            socket.off("webrtc:peer-left", handlePeerLeft)
            socket.off("webrtc:error", handleError)

            pcRef.current?.close()

            pendingCandidates.current = []

            setRemoteStream(null)

            pcRef.current = null
        }

    }, [socket, isJoined, isReady, role, sessionId, iceServers])

    function joinRoom() {
        if (!socket) return
        setIsJoined(true)
    }

    function toggleMute() {

        if (!localStreamRef.current) return

        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })

        setIsMuted(prev => !prev)
    }

    function toggleCamera() {

        if (!localStreamRef.current) return

        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })

        setIsCameraOff(prev => !prev)
    }

    function endCall() {

        localStreamRef.current?.getTracks().forEach(track => track.stop())

        pcRef.current?.close()

        if (socket?.connected) {
            socket.emit("webrtc:leave", { sessionId })
        }

        pendingCandidates.current = []

        setLocalStream(null)
        setRemoteStream(null)
        setConnectionState("closed")
        setIsJoined(false)
        setIsReady(false)

        pcRef.current = null
        localStreamRef.current = null
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
        isReconnected,
        initMedia,
        joinRoom,
        toggleMute,
        toggleCamera,
        endCall
    }
    
}