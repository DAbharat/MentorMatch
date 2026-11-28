"use client"

import React, { useEffect, useRef } from 'react'
import { Phone, Mic, MicOff, Video, VideoOff, MonitorOff, Monitor } from 'lucide-react'
import { toast } from 'sonner';

type VideoCallScreenProps = {
    sessionId: string;
    mentor: {
        id: string;
        name: string;
    };
    mentee: {
        id: string;
        name: string;
    };
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    micEnabled: boolean;
    cameraEnabled: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onEndCall: () => void;
    isUserMentor: boolean;
    elapsedTime: string;
    connectionState: RTCPeerConnectionState;
    isPeerConnected: boolean;
    isReconnected: boolean;
    isScreenSharing: boolean;
    isPeerScreenSharing: boolean;
    onStartScreenShare: () => Promise<void>;
    onStopScreenShare: () => Promise<void>;
}

export default function VideoCallScreen({
    sessionId,
    mentor,
    mentee,
    localStream,
    remoteStream,
    micEnabled,
    cameraEnabled,
    onToggleMic,
    onToggleCamera,
    onEndCall,
    isUserMentor,
    elapsedTime,
    connectionState,
    isPeerConnected,
    isReconnected,
    isScreenSharing,
    isPeerScreenSharing,
    onStartScreenShare,
    onStopScreenShare
}: VideoCallScreenProps) {

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const hasShownReconnectToast = useRef(false)
    const hasShownDisconnectToast = useRef(false)

    const handleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                await onStopScreenShare()
            } else {
                await onStartScreenShare()
            }
        } catch (error) {
            console.error("Screen share error:", error)
            toast.error("Screen share failed")
        }
    }

    useEffect(() => {
        if (isReconnected) {
            if (!hasShownReconnectToast.current) {
                toast.success("Peer reconnected!")
                hasShownReconnectToast.current = true
            }
        }
    }, [isReconnected])

    useEffect(() => {
        if (!isPeerConnected) {
            hasShownReconnectToast.current = false
        }
    }, [isPeerConnected])

    useEffect(() => {
        if (!isPeerConnected && connectionState === "disconnected") {
            if (!hasShownDisconnectToast.current) {
                toast.error("Peer disconnected!")
                hasShownDisconnectToast.current = true
            }
        }

        if (isPeerConnected) {
            hasShownDisconnectToast.current = false
        }
    }, [isPeerConnected, connectionState])

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const currentUser = isUserMentor ? mentor : mentee
    const otherUser = isUserMentor ? mentee : mentor

    const getConnectionColor = () => {
        if (connectionState === "connected") return "#10b981"
        if (connectionState === "connecting") return "#dfc47a"
        return "#f4b8bc"
    }

    const getConnectionText = () => {
        if (connectionState === "connected") return "Connected"
        if (connectionState === "connecting") return "Connecting..."
        return "Disconnected"
    }

    return (
        <div
            className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#090a08] text-[#f2f0e8] transition-opacity duration-300"
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            <header className="shrink-0 border-b border-[#1e2419] bg-[#11140e] px-3 py-2 sm:px-5 sm:py-2.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-semibold text-[#f2f0e8] sm:text-base">
                            {otherUser.name}
                        </h1>
                        <div className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: getConnectionColor() }}
                            />
                            <p className="text-xs text-[#a8ab9e]">{getConnectionText()}</p>
                        </div>
                    </div>

                    <div className="text-right sm:text-center">
                        <p className="text-[11px] text-[#a8ab9e]">Duration</p>
                        <p className="font-mono text-lg font-semibold tabular-nums text-[#f2f0e8] sm:text-xl">
                            {elapsedTime}
                        </p>
                    </div>

                    <div className="hidden truncate text-right text-xs text-[#a8ab9e] sm:block">
                        <span className="sr-only">Session ID: </span>
                        <span className="font-mono">ID: {sessionId.slice(0, 8)}...</span>
                    </div>
                </div>
            </header>

            <div
                role="group"
                aria-label="Call participants"
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3 md:flex-row"
            >
                <section className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#242a1e] bg-[#11140e]">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            aria-label={`${otherUser.name}'s video`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex min-w-0 flex-col items-center gap-2 px-3 text-center">
                            <div
                                aria-hidden="true"
                                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#2a3322] bg-[#161b12] text-2xl font-semibold text-[#b7cc7e] sm:h-20 sm:w-20"
                            >
                                {otherUser.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="max-w-full break-words text-sm text-[#a8ab9e]">
                                Waiting for <span className="font-semibold text-[#f2f0e8]">{otherUser.name}</span>
                            </p>
                        </div>
                    )}

                    <div
                        className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md border border-[#242a1e] bg-[#090a08]/90 px-2.5 py-1 text-xs text-[#c7cabf]"
                    >
                        {otherUser.name}
                    </div>
                </section>

                <section className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#242a1e] bg-[#11140e]">
                    {cameraEnabled && localStream ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            aria-label="Your video"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 p-3">
                            <div
                                aria-hidden="true"
                                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#2a3322] bg-[#161b12] text-2xl font-semibold text-[#b7cc7e] sm:h-20 sm:w-20"
                            >
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs text-[#a8ab9e]">Camera off</p>
                        </div>
                    )}

                    <div
                        className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md border border-[#242a1e] bg-[#090a08]/90 px-2.5 py-1 text-xs text-[#c7cabf]"
                    >
                        You ({currentUser.name.split(' ')[0]})
                    </div>

                    <div
                        role="status"
                        className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md border border-[#242a1e] bg-[#090a08]/90 px-2 py-1 text-xs font-medium"
                        style={{
                            color: micEnabled ? '#10b981' : '#f4b8bc',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: micEnabled ? '#10b981' : '#f4b8bc' }}
                        />
                        <span>Mic {micEnabled ? 'on' : 'off'}</span>
                    </div>
                </section>
            </div>

            <footer className="shrink-0 border-t border-[#1e2419] bg-[#11140e] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-3 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="mx-auto grid w-full max-w-sm grid-cols-4 gap-1 sm:gap-3">
                    <button
                        onClick={onToggleMic}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116]"
                        aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
                    >
                        <div
                            aria-hidden="true"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors sm:h-12 sm:w-12"
                            style={{
                                backgroundColor: micEnabled ? '#161b12' : '#231214',
                                borderColor: micEnabled ? '#2a3322' : '#61282d',
                            }}
                        >
                            {micEnabled ? (
                                <Mic className="h-5 w-5 text-[#c7cabf]" />
                            ) : (
                                <MicOff className="h-5 w-5 text-[#f4b8bc]" />
                            )}
                        </div>
                        <span className={`max-w-full truncate text-[11px] font-medium ${micEnabled ? "text-[#c7cabf]" : "text-[#f4b8bc]"}`}>
                            {micEnabled ? 'Mute' : 'Unmute'}
                        </span>
                    </button>

                    <button
                        onClick={onToggleCamera}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116]"
                        aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
                    >
                        <div
                            aria-hidden="true"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors sm:h-12 sm:w-12"
                            style={{
                                backgroundColor: cameraEnabled ? '#161b12' : '#231214',
                                borderColor: cameraEnabled ? '#2a3322' : '#61282d',
                            }}
                        >
                            {cameraEnabled ? (
                                <Video className="h-5 w-5 text-[#c7cabf]" />
                            ) : (
                                <VideoOff className="h-5 w-5 text-[#f4b8bc]" />
                            )}
                        </div>
                        <span className={`max-w-full truncate text-[11px] font-medium ${cameraEnabled ? "text-[#c7cabf]" : "text-[#f4b8bc]"}`}>
                            {cameraEnabled ? 'Camera off' : 'Camera on'}
                        </span>
                    </button>

                    <button
                        onClick={handleScreenShare}
                        disabled={isPeerScreenSharing}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116] disabled:cursor-not-allowed"
                        aria-label={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                    >
                        <div
                            aria-hidden="true"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors sm:h-12 sm:w-12"
                            style={{
                                backgroundColor: isPeerScreenSharing ? '#0d0f0b' : isScreenSharing ? '#1b2116' : '#161b12',
                                borderColor: isPeerScreenSharing ? '#283022' : isScreenSharing ? '#323d28' : '#2a3322',
                            }}
                        >
                            {isScreenSharing ? (
                                <Monitor className="h-5 w-5 text-[#b7cc7e]" />
                            ) : (
                                <MonitorOff className={`h-5 w-5 ${isPeerScreenSharing ? "text-[#8e9484]" : "text-[#c7cabf]"}`} />
                            )}
                        </div>
                        <span className={`max-w-full truncate text-[11px] font-medium ${isPeerScreenSharing ? "text-[#8e9484]" : "text-[#c7cabf]"}`}>
                            {isPeerScreenSharing ? 'Peer sharing' : isScreenSharing ? 'Stop share' : 'Share screen'}
                        </span>
                    </button>

                    <button
                        onClick={onEndCall}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#231214] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4b8bc] active:bg-[#2b181a]"
                        aria-label="End call"
                    >
                        <div
                            aria-hidden="true"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#61282d] bg-[#231214] transition-colors group-hover:bg-[#2b181a] sm:h-12 sm:w-12"
                        >
                            <Phone className="h-5 w-5 rotate-135 text-[#f4b8bc]" />
                        </div>
                        <span className="max-w-full truncate text-[11px] font-medium text-[#f4b8bc]">
                            End Call
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    )
}