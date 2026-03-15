"use client"

import React from 'react'

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
}

export default function InitialScreen({
    id,
    mentor,
    mentee,
    micEnabled,
    cameraEnabled,
    onToggleMic,
    onToggleCamera,
    onJoinCall
}: InitialScreenProps) {
    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center"
            style={{ backgroundColor: '#0b090a', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            {/* Session info */}
            <div className="mb-6 text-center">
                <p className="text-[#a0a0a0] text-sm tracking-widest uppercase mb-1 font-light">
                    Session with
                </p>
                <h1 className="text-white text-2xl font-semibold tracking-tight">
                    {mentor.name}
                    <span className="text-[#444] mx-2 font-extralight">&amp;</span>
                    {mentee.name}
                </h1>
            </div>

            {/* Video preview card */}
            <div
                className="relative rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                    width: '480px',
                    height: '270px',
                    backgroundColor: '#0b090a',
                    border: '1px solid #1f1f1f',
                    boxShadow: '0 0 0 1px #1f1f1f, 0 24px 64px rgba(0,0,0,0.7)',
                }}
            >
                {/* Camera off state */}
                {!cameraEnabled && (
                    <div className="flex flex-col items-center gap-3 select-none">
                        {/* Avatar placeholder */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white"
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

                {/* Camera enabled state — slot for actual video stream */}
                {cameraEnabled && (
                    <div className="w-full h-full bg-[#111] flex items-center justify-center">
                        {/* Video element would be injected here via ref in the parent */}
                        <p className="text-[#555] text-xs">Camera stream</p>
                    </div>
                )}

                {/* Top-right mic indicator badge */}
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

                {/* Bottom-left: own name label */}
                <div
                    className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs text-[#aaa]"
                    style={{ backgroundColor: 'rgba(11,9,10,0.7)', backdropFilter: 'blur(8px)', border: '1px solid #1f1f1f' }}
                >
                    {mentee.name} (You)
                </div>
            </div>

            {/* Controls row */}
            <div className="mt-6 flex items-center gap-3">
                {/* Toggle Mic */}
                <button
                    type="button"
                    onClick={onToggleMic}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            backgroundColor: micEnabled ? '#1a1a1a' : '#3b1f1f',
                            border: micEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                        }}
                    >
                        {micEnabled ? (
                            // Mic icon
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="2" width="6" height="11" rx="3" fill="#e0e0e0" />
                                <path d="M5 11a7 7 0 0 0 14 0" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="12" y1="18" x2="12" y2="22" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="9" y1="22" x2="15" y2="22" stroke="#e0e0e0" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        ) : (
                            // Mic muted icon
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="2" width="6" height="11" rx="3" fill="#f87171" opacity="0.6" />
                                <path d="M5 11a7 7 0 0 0 14 0" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
                                <line x1="12" y1="18" x2="12" y2="22" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="9" y1="22" x2="15" y2="22" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="3" y1="3" x2="21" y2="21" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: micEnabled ? '#888' : '#f87171' }}>
                        {micEnabled ? 'Mute' : 'Unmute'}
                    </span>
                </button>

                {/* Toggle Camera */}
                <button
                    type="button"
                    onClick={onToggleCamera}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            backgroundColor: cameraEnabled ? '#1a1a1a' : '#3b1f1f',
                            border: cameraEnabled ? '1px solid #2e2e2e' : '1px solid #5a2020',
                        }}
                    >
                        {cameraEnabled ? (
                            // Camera on
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="7" width="15" height="11" rx="2" stroke="#e0e0e0" strokeWidth="1.8" />
                                <path d="M17 10l5-3v10l-5-3V10z" stroke="#e0e0e0" strokeWidth="1.8" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            // Camera off
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="7" width="15" height="11" rx="2" stroke="#f87171" strokeWidth="1.8" opacity="0.6" />
                                <path d="M17 10l5-3v10l-5-3V10z" stroke="#f87171" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />
                                <line x1="3" y1="3" x2="21" y2="21" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: cameraEnabled ? '#888' : '#f87171' }}>
                        {cameraEnabled ? 'Stop video' : 'Start video'}
                    </span>
                </button>

                {/* Spacer */}
                <div className="w-px h-10 mx-1" style={{ backgroundColor: '#1f1f1f' }} />

                {/* Join Call */}
                <button
                    type="button"
                    onClick={onJoinCall}
                    className="flex flex-col items-center gap-1.5 focus:outline-none"
                    aria-label="Join call"
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #1a5c38 0%, #166534 100%)',
                            border: '1px solid #22c55e55',
                            boxShadow: '0 0 16px rgba(34,197,94,0.15)',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="#4ade80" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: '#4ade80' }}>
                        Join
                    </span>
                </button>
            </div>

            {/* Footer note */}
            <p className="mt-8 text-[#333] text-xs tracking-wide">
                Session ID: <span className="font-mono text-[#444]">{id}</span>
            </p>
        </div>
    )
}