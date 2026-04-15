"use client"

import { useWebRTC } from '@/hooks/useWebRTC'
import React, { useEffect, useState } from 'react'
import ShareScreenLayout from './ShareScreenLayout'
import VideoCallScreen from './VideoCallScreen'

type CallContainerProps = {
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
    elapsedTime: string;
    connectionState: RTCPeerConnectionState;
    isPeerConnected: boolean;
    isScreenSharing: boolean;
    isPeerScreenSharing: boolean;
    toggleMute: () => void;
    toggleCamera: () => void;
    startScreenShare: () => void;
    stopScreenShare: () => void;
    endCall: () => void;
    isMuted: boolean;
    isCameraOff: boolean;
    role: "mentor" | "mentee";
    iceServers: RTCIceServer[];
    socket: any; 
}

export default function CallContainer(props: CallContainerProps) {
    const webRTCRole = props.role === "mentor" ? "MENTOR" : "MENTEE"

    const webRTCResult = useWebRTC({
        sessionId: props.sessionId,
        role: webRTCRole,
        iceServers: props.iceServers,
        socket: props.socket
    })

    const {
        localStream,
        remoteStream,
        connectionState,
        isPeerConnected,
        isScreenSharing,
        isPeerScreenSharing,
        stopScreenShare,
        startScreenShare,
        toggleMute,
        toggleCamera,
        endCall,
        isMuted,
        isCameraOff
    } = webRTCResult

    console.log("DEBUG CallContainer - startScreenShare:", typeof startScreenShare)
    console.log("DEBUG CallContainer - stopScreenShare:", typeof stopScreenShare)

    const isAnyoneSharing = isScreenSharing || isPeerScreenSharing

    const [wasDisconnected, setWasDisconnected] = useState(false)

    useEffect(() => {
        if(connectionState === "disconnected") {
            setWasDisconnected(true)
        }
        if(connectionState === "connected" && wasDisconnected) {
            setWasDisconnected(false)
        }
    }, [connectionState])

    const isReconnected = connectionState === "connected" && wasDisconnected
    

    if (isAnyoneSharing) {
        return (
            <ShareScreenLayout
                sessionId={props.sessionId}
                mentor={props.mentor}
                mentee={props.mentee}
                isUserMentor={props.isUserMentor}
                localStream={localStream}
                remoteStream={remoteStream}
                micEnabled={!isMuted}
                cameraEnabled={!isCameraOff}
                isScreenSharing={isScreenSharing}
                isPeerScreenSharing={isPeerScreenSharing}
                onStopScreenShare={stopScreenShare}
                onToggleMic={toggleMute}
                onToggleCamera={toggleCamera}
                onEndCall={endCall}
                elapsedTime={props.elapsedTime}
                connectionState={connectionState}
                isPeerConnected={isPeerConnected}
            />
        )
    }

    return (
        <VideoCallScreen
            sessionId={props.sessionId}
            mentor={props.mentor}
            mentee={props.mentee}
            localStream={localStream}
            remoteStream={remoteStream}
            micEnabled={!isMuted}
            cameraEnabled={!isCameraOff}
            onToggleMic={toggleMute}
            onToggleCamera={toggleCamera}
            onEndCall={endCall}
            isUserMentor={props.isUserMentor}
            elapsedTime={props.elapsedTime}
            connectionState={connectionState}
            isPeerConnected={isPeerConnected}
            isReconnected={isReconnected}
            isScreenSharing={isScreenSharing}
            isPeerScreenSharing={isPeerScreenSharing}
            onStartScreenShare={startScreenShare}
            onStopScreenShare={stopScreenShare}
        />
    )
}

