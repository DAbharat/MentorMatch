"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { toast } from 'sonner';

type VideoCallScreenProps = {
    sessionId: string;
    mentor: {
        id: string;
        name: string;
        clerkUserId: string;
    };
    mentee: {
        id: string;
        name: string;
        clerkUserId: string;
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
}: VideoCallScreenProps) {

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const [isMobileView, setIsMobileView] = useState(false)

    const hasShownReconnectToast = useRef(false)
    const hasShownDisconnectToast = useRef(false)

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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const currentUser = isUserMentor ? mentor : mentee
    const otherUser = isUserMentor ? mentee : mentor

    const getConnectionColor = () => {
        if (connectionState === "connected") return "#4ade80"
        if (connectionState === "connecting") return "#fbbf24"
        return "#f87171"
    }

    const getConnectionText = () => {
        if (connectionState === "connected") return "Connected"
        if (connectionState === "connecting") return "Connecting..."
        return "Disconnected"
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col transition-opacity duration-300 opacity-100"
            style={{ backgroundColor: '#0b090a', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            {!isPeerConnected && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded z-50">
                    {connectionState === "connecting"
                        ? "Connecting to user..."
                        : "Waiting for other user..."}
                </div>
            )}

            {/* Header */}
            <div className="bg-[#111315] border-b border-[#1f1f1f] px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex flex-col">
                            <h1 className="text-sm sm:text-base text-white font-semibold">
                                {otherUser.name}
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getConnectionColor() }}
                                />
                                <p className="text-xs text-[#888]">{getConnectionText()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-[#888] mb-0.5">Duration</p>
                        <p className="font-mono text-lg sm:text-xl font-bold text-white">
                            {elapsedTime}
                        </p>
                    </div>

                    <div className="text-right text-xs text-[#666]">
                        ID: <span className="font-mono text-[#888]">{sessionId.slice(0, 8)}...</span>
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 flex flex-col md:flex-row gap-2 sm:gap-3 p-3 sm:p-4 overflow-hidden">
                {/* Remote Video (Main) */}
                <div className="flex-1 flex flex-col gap-2">
                    <div
                        className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center relative"
                        style={{
                            backgroundColor: '#111',
                            border: '1px solid #1f1f1f',
                            minHeight: '300px',
                            boxShadow: '0 0 0 1px #1f1f1f, 0 24px 64px rgba(0,0,0,0.5)',
                        }}
                    >
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-semibold text-white"
                                    style={{
                                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                        border: '1px solid #2e2e2e',
                                    }}
                                >
                                    {otherUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="text-[#888] text-sm">Waiting for</p>
                                    <p className="text-white font-semibold">{otherUser.name}</p>
                                </div>
                            </div>
                        )}

                        {/* User Label */}
                        <div
                            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs text-[#aaa]"
                            style={{ backgroundColor: 'rgba(11,9,10,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #1f1f1f' }}
                        >
                            {otherUser.name}
                        </div>
                    </div>
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className={`rounded-2xl overflow-hidden relative border border-[#1f1f1f] flex items-center justify-center ${isMobileView ? 'h-32' : 'md:w-56 lg:w-64 h-auto'
                    }`}
                    style={{
                        backgroundColor: '#111',
                        boxShadow: '0 0 0 1px #1f1f1f, 0 24px 64px rgba(0,0,0,0.5)',
                    }}
                >
                    {cameraEnabled && localStream ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 p-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                    border: '1px solid #2e2e2e',
                                }}
                            >
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[#555] text-xs text-center">Camera Off</p>
                        </div>
                    )}

                    {/* Local User Label */}
                    <div
                        className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs text-[#aaa]"
                        style={{ backgroundColor: 'rgba(11,9,10,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #1f1f1f' }}
                    >
                        You ({currentUser.name.split(' ')[0]})
                    </div>

                    {/* Mic Badge */}
                    <div
                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: micEnabled ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            border: micEnabled ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                            color: micEnabled ? '#4ade80' : '#f87171',
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: micEnabled ? '#4ade80' : '#f87171' }}
                        />
                        <span>{micEnabled ? 'On' : 'Off'}</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div
                className="px-4 sm:px-6 py-4 sm:py-5 border-t border-[#1f1f1f] bg-[#111315]"
            >
                <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                    {/* Mic Button */}
                    <button
                        onClick={onToggleMic}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                        title={micEnabled ? "Mute" : "Unmute"}
                    >
                        <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: micEnabled ? '#1a1a1a' : '#3b1f1f',
                                border: micEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                            }}
                        >
                            {micEnabled ? (
                                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#e0e0e0]" />
                            ) : (
                                <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-[#f87171]" />
                            )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-center" style={{ color: micEnabled ? '#888' : '#f87171' }}>
                            {micEnabled ? 'Mute' : 'Unmute'}
                        </span>
                    </button>

                    {/* Camera Button */}
                    <button
                        onClick={onToggleCamera}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                        title={cameraEnabled ? "Stop Video" : "Start Video"}
                    >
                        <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: cameraEnabled ? '#1a1a1a' : '#3b1f1f',
                                border: cameraEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                            }}
                        >
                            {cameraEnabled ? (
                                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-[#e0e0e0]" />
                            ) : (
                                <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-[#f87171]" />
                            )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-center" style={{ color: cameraEnabled ? '#888' : '#f87171' }}>
                            {cameraEnabled ? 'Stop' : 'Start'}
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-10 sm:h-12 mx-1" style={{ backgroundColor: '#1f1f1f' }} />

                    {/* End Call Button */}
                    <button
                        onClick={onEndCall}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                        title="End Call"
                    >
                        <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #7f1d1d 0%, #5f0f0f 100%)',
                                border: '1px solid #dc262655',
                            }}
                        >
                            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#fca5a5] rotate-135" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#fca5a5' }}>
                            End Call
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

