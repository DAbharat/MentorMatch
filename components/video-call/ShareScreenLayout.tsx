"use client"

import { Mic, MicOff, Monitor, Phone, Video, VideoOff } from 'lucide-react';
import React, { useEffect, useRef } from 'react'

type ShareScreenLayoutProps = {
    sessionId: string;
    mentor: {
        id: string;
        name: string;
    };
    mentee: {
        id: string;
        name: string;
    };
    isUserMentor: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    micEnabled: boolean;
    cameraEnabled: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onEndCall: () => void;
    onStopScreenShare: () => void;
    isScreenSharing: boolean;
    isPeerScreenSharing: boolean;
    connectionState: RTCPeerConnectionState;
    isPeerConnected: boolean;
    elapsedTime: string;
}

export default function ShareScreenLayout({
    sessionId,
    mentor,
    mentee,
    isUserMentor,
    localStream,
    remoteStream,
    micEnabled,
    cameraEnabled,
    onToggleMic,
    onToggleCamera,
    onEndCall,
    onStopScreenShare,
    isScreenSharing,
    isPeerScreenSharing,
    connectionState,
    isPeerConnected,
    elapsedTime
}: ShareScreenLayoutProps) {

    const mainVideoRef = useRef<HTMLVideoElement>(null)
    const pipVideoRef = useRef<HTMLVideoElement>(null)

    const isLocalPresenter = isScreenSharing
    const currentUser = isUserMentor ? mentor : mentee
    const otherUser = isUserMentor ? mentee : mentor

    useEffect(() => {
        if (mainVideoRef.current) {
            mainVideoRef.current.srcObject = isLocalPresenter
                ? localStream
                : remoteStream
        }
    }, [localStream, remoteStream, isLocalPresenter])

    useEffect(() => {
        if (pipVideoRef.current) {
            pipVideoRef.current.srcObject = isLocalPresenter
                ? remoteStream
                : localStream
        }
    }, [remoteStream, localStream, isLocalPresenter])

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
        <div className="min-h-screen flex flex-col bg-[#0b090a] text-white">

            {/* HEADER */}
            <div className="bg-[#111315] border-b border-[#1f1f1f] px-4 py-3 flex justify-between items-center">

                <div>
                    <p className="font-semibold">{otherUser.name}</p>
                    <div className="flex items-center gap-1 text-xs text-[#888]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getConnectionColor() }} />
                        {getConnectionText()}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-[#888]">Duration</p>
                    <p className="font-mono">{elapsedTime}</p>
                </div>

                <div className="text-xs text-[#666]">
                    ID: {sessionId.slice(0, 8)}...
                </div>
            </div>

            {/* MAIN SCREEN */}
            <div className="flex-1 relative flex items-center justify-center bg-black">

                {remoteStream || localStream ? (
                    <video
                        ref={mainVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-semibold text-white"
                            style={{
                                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                border: '1px solid #2e2e2e',
                            }}
                        >
                            {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[#888] text-sm">Waiting for {otherUser.name}...</p>
                    </div>
                )}

                {/* PRESENTING BADGE */}
                <div className="absolute top-4 left-4 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/20 border border-blue-500/50 text-blue-300 flex items-center gap-2">
                    <span className="text-sm">📺</span>
                    {isLocalPresenter ? "You are presenting" : `${otherUser.name} is presenting`}
                </div>

                {/* PiP */}
                <div className="absolute bottom-4 right-4 w-40 sm:w-48 md:w-52 rounded-2xl overflow-hidden border border-[#1f1f1f] bg-[#111] shadow-lg">

                    {cameraEnabled && (isLocalPresenter ? remoteStream : localStream) ? (
                        <video
                            ref={pipVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-32 sm:h-40 object-cover"
                        />
                    ) : (
                        <div className="w-full h-32 sm:h-40 flex items-center justify-center bg-[#1a1a1a]">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{
                                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                    border: '1px solid #2e2e2e',
                                }}
                            >
                                {(isLocalPresenter ? otherUser.name : currentUser.name).charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Label */}
                    <div
                        className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(11,9,10,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #1f1f1f' }}
                    >
                        {isLocalPresenter ? otherUser.name : `You (${currentUser.name.split(' ')[0]})`}
                    </div>

                    {/* Mic badge */}
                    <div
                        className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-medium"
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
                        {micEnabled ? 'Mic On' : 'Mic Off'}
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="bg-[#111315] border-t border-[#1f1f1f] px-4 py-4 flex justify-center gap-3 sm:gap-4 flex-wrap">

                {/* MIC */}
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
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: micEnabled ? '#888' : '#f87171' }}>
                        {micEnabled ? 'Mute' : 'Unmute'}
                    </span>
                </button>

                {/* CAMERA */}
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
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: cameraEnabled ? '#888' : '#f87171' }}>
                        {cameraEnabled ? 'Stop' : 'Start'}
                    </span>
                </button>

                {/* STOP SHARE */}
                {isScreenSharing && (
                    <button
                        onClick={onStopScreenShare}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                        title="Stop Sharing"
                    >
                        <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #2e2e2e',
                            }}
                        >
                            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-[#e0e0e0]" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-[#888]">
                            Stop Sharing
                        </span>
                    </button>
                )}

                {/* Divider */}
                <div className="w-px h-10 sm:h-12 mx-1" style={{ backgroundColor: '#1f1f1f' }} />

                {/* END CALL */}
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
    )
}

