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
    mediaError: string | null;
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
    localStream,
    mediaError
}: InitialScreenProps) {

    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if(videoRef.current && localStream) {
            videoRef.current.srcObject = localStream
        }
    }, [localStream])

    return (
        <div
            className="flex h-full min-h-0 w-full flex-col gap-2 overflow-hidden bg-[#090a08] px-3 pt-3 text-[#f2f0e8] sm:gap-3 sm:px-6 sm:pt-4"
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            <header className="shrink-0 text-center">
                <p className="text-xs font-medium text-[#a8ab9e]">Session with</p>
                <h1 className="mx-auto mt-1 flex max-w-full flex-wrap items-center justify-center gap-x-2 text-xl font-semibold tracking-tight text-[#f2f0e8] sm:text-2xl lg:text-3xl">
                    <span className="break-words">{mentor.name}</span>
                    <span aria-hidden="true" className="text-[#8e9484]">&amp;</span>
                    <span className="break-words">{mentee.name}</span>
                </h1>
            </header>

            <div
                role="group"
                aria-label="Camera preview"
                className="flex min-h-0 w-full flex-1 items-center justify-center"
            >
                <div className="relative aspect-video max-h-full w-full max-w-3xl overflow-hidden rounded-2xl border border-[#242a1e] bg-[#11140e]">
                    {cameraEnabled && localStream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            aria-label="Your camera preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                            <div
                                aria-hidden="true"
                                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#2a3322] bg-[#161b12] text-2xl font-semibold text-[#b7cc7e]"
                            >
                                {mentee.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm text-[#c7cabf]">
                                {mediaError ? "Camera preview unavailable" : cameraEnabled ? "Camera unavailable" : "Camera is off"}
                            </p>
                            {mediaError && (
                                <p
                                    role="alert"
                                    className="max-w-[min(90%,32rem)] break-words text-xs text-[#f4b8bc]"
                                >
                                    {mediaError}
                                </p>
                            )}
                        </div>
                    )}

                    <div
                        role="status"
                        className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md border border-[#242a1e] bg-[#090a08]/90 px-2 py-1 text-xs font-medium"
                        style={{ color: micEnabled ? '#10b981' : '#f4b8bc' }}
                    >
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: micEnabled ? '#10b981' : '#f4b8bc' }}
                        />
                        {micEnabled ? 'Mic on' : 'Mic off'}
                    </div>

                    <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md border border-[#242a1e] bg-[#090a08]/90 px-2.5 py-1 text-xs text-[#c7cabf] sm:bottom-3 sm:left-3">
                        {mentee.name} (You)
                    </div>
                </div>
            </div>

            <footer className="shrink-0 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div
                    role="group"
                    aria-label="Call controls"
                    className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2"
                >
                    <button
                        type="button"
                        onClick={onToggleMic}
                        aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116]"
                    >
                        <span
                            aria-hidden="true"
                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${micEnabled ? "border-[#2a3322] bg-[#161b12] text-[#c7cabf]" : "border-[#61282d] bg-[#231214] text-[#f4b8bc]"}`}
                        >
                            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </span>
                        <span className={`max-w-full truncate text-[11px] font-medium ${micEnabled ? "text-[#c7cabf]" : "text-[#f4b8bc]"}`}>
                            {micEnabled ? 'Mute' : 'Unmute'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onToggleCamera}
                        aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116]"
                    >
                        <span
                            aria-hidden="true"
                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${cameraEnabled ? "border-[#2a3322] bg-[#161b12] text-[#c7cabf]" : "border-[#61282d] bg-[#231214] text-[#f4b8bc]"}`}
                        >
                            {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </span>
                        <span className={`max-w-full truncate text-[11px] font-medium ${cameraEnabled ? "text-[#c7cabf]" : "text-[#f4b8bc]"}`}>
                            {cameraEnabled ? 'Camera off' : 'Camera on'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onJoinCall}
                        aria-label="Join call"
                        className="group flex min-h-16 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-[#161b12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7cc7e] active:bg-[#1b2116]"
                    >
                        <span
                            aria-hidden="true"
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8fa654] text-[#0b0d08] transition-colors group-hover:bg-[#9eb660] group-active:bg-[#7f9449]"
                        >
                            <Phone className="h-5 w-5 rotate-135" />
                        </span>
                        <span className="text-[11px] font-semibold text-[#b7cc7e]">Join</span>
                    </button>
                </div>

                <p className="mx-auto mt-1 max-w-full break-all text-center text-xs text-[#8a8f80]">
                    Session ID: <span className="font-mono text-[#a8ab9e]">{id}</span>
                </p>
            </footer>
        </div>
    )
}