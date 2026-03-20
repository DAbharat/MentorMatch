"use client"

import React, { useEffect, useRef } from 'react'

type InitialScreenProps = {
    id: string;
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
            <div className="mt-6 flex items-center gap-3">
                {/* Mic */}
                <button
                    type="button"
                    onClick={onToggleMic}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                    <div
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            backgroundColor: micEnabled ? '#1a1a1a' : '#3b1f1f',
                            border: micEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                        }}
                    >
                        {micEnabled ? (
                            <svg className="lg:w-5 lg:h-5" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="2" width="6" height="11" rx="3" fill="#e0e0e0" />
                                <path d="M5 11a7 7 0 0 0 14 0" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="12" y1="18" x2="12" y2="22" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="9" y1="22" x2="15" y2="22" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg className="lg:w-5 lg:h-5" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="2" width="6" height="11" rx="3" fill="#f87171" opacity="0.6" />
                                <path d="M5 11a7 7 0 0 0 14 0" stroke="#f87171" strokeWidth="1.8" opacity="0.6" />
                                <line x1="3" y1="3" x2="21" y2="21" stroke="#f87171" strokeWidth="1.8" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: micEnabled ? '#888' : '#f87171' }}>
                        {micEnabled ? 'Mute' : 'Unmute'}
                    </span>
                </button>

                {/* Camera */}
                <button
                    type="button"
                    onClick={onToggleCamera}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                    <div
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            backgroundColor: cameraEnabled ? '#1a1a1a' : '#3b1f1f',
                            border: cameraEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                        }}
                    >
                        <svg className="lg:w-5 lg:h-5" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="7" width="15" height="11" rx="2"
                                stroke={cameraEnabled ? "#e0e0e0" : "#f87171"} strokeWidth="1.8" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: cameraEnabled ? '#888' : '#f87171' }}>
                        {cameraEnabled ? 'Stop video' : 'Start video'}
                    </span>
                </button>

                <div className="w-px h-10 mx-1" style={{ backgroundColor: '#1f1f1f' }} />

                {/* Join */}
                <button
                    type="button"
                    onClick={onJoinCall}
                    className="flex flex-col items-center gap-1.5"
                >
                    <div
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #1a5c38 0%, #166534 100%)',
                            border: '1px solid #22c55e55',
                        }}
                    >
                        <svg className="lg:w-5 lg:h-5" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6" fill="#4ade80" />
                        </svg>
                    </div>
                    <span className="text-[11px]" style={{ color: '#4ade80' }}>Join</span>
                </button>
            </div>

            <p className="mt-8 text-[#333] text-xs">
                Session ID: <span className="font-mono text-[#444]">{id}</span>
            </p>
        </div>
    )
}