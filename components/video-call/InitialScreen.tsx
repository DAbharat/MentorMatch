"use client"

import React, { useEffect, useRef } from 'react'
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react'

type InitialScreenProps = {
    id: string;
    mentor: {
        id: string;
        name: string;
    };
    mentee: {
        id: string;
        name: string;
    };
    micEnabled: boolean;
    cameraEnabled: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onJoinCall: () => void;
    localStream: MediaStream | null;
}

export default function InitialScreen({
    id,
    mentor,
    mentee,
    micEnabled,
    cameraEnabled,
    onToggleMic,
    onToggleCamera,
    onJoinCall,
    localStream
}: InitialScreenProps) {

    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if(videoRef.current && localStream) {
            videoRef.current.srcObject = localStream
        }
    }, [localStream])

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10"
            style={{ backgroundColor: '#0b090a', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            {/* Session info */}
            <div className="mb-6 text-center">
                <p className="text-[#a0a0a0] text-sm tracking-widest uppercase mb-1 font-light">
                    Session with
                </p>
                <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">
                    {mentor.name}
                    <span className="text-[#444] mx-2 font-extralight">&amp;</span>
                    {mentee.name}
                </h1>
            </div>

            {/* Video preview card */}
            <div className="w-full max-w-160 lg:max-w-150">
                <div
                    className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{
                        aspectRatio: '16 / 9',
                        backgroundColor: '#0b090a',
                        border: '1px solid #1f1f1f',
                        boxShadow: '0 0 0 1px #1f1f1f, 0 24px 64px rgba(0,0,0,0.7)',
                    }}
                >
                    {/* Camera off */}
                    {!cameraEnabled && (
                        <div className="flex flex-col items-center gap-3 select-none">
                            <div
                                className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-semibold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                                    border: '1px solid #2e2e2e',
                                }}
                            >
                                {mentee.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[#555] text-sm tracking-wide">Camera is off</p>
                        </div>
                    )}

                    {/* Camera on */}
                    {cameraEnabled && (
                        <div className="w-full h-full bg-[#111] flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Mic badge */}
                    <div
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
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
                        {micEnabled ? 'Mic on' : 'Mic off'}
                    </div>

                    {/* Name */}
                    <div
                        className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs text-[#aaa]"
                        style={{ backgroundColor: 'rgba(11,9,10,0.7)', backdropFilter: 'blur(8px)', border: '1px solid #1f1f1f' }}
                    >
                        {mentee.name} (You)
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                {/* Mic */}
                <button
                    type="button"
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

                {/* Camera */}
                <button
                    type="button"
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

                <div className="w-px h-10 sm:h-12 mx-1" style={{ backgroundColor: '#1f1f1f' }} />

                {/* Join Call */}
                <button
                    type="button"
                    onClick={onJoinCall}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    title="Join Call"
                >
                    <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #1a5c38 0%, #166534 100%)',
                            border: '1px solid #22c55e55',
                        }}
                    >
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#4ade80]" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#4ade80' }}>
                        Join
                    </span>
                </button>
            </div>

            <p className="mt-8 text-[#333] text-xs">
                Session ID: <span className="font-mono text-[#444]">{id}</span>
            </p>
        </div>
    )
}