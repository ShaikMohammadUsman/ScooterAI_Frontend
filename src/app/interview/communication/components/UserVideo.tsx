import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { VoiceWave } from './VoiceWave';
import { useMediaStream } from '@/hooks/useMediaStream';

interface UserVideoProps {
    showVideo: boolean;
}

export function UserVideo({ showVideo }: UserVideoProps) {
    const { stream, isVideoOn, isAudioOn, voiceStrength, startStream, stopStream, toggleVideo, toggleAudio } = useMediaStream();

    const videoRef = useRef<HTMLVideoElement>(null);
    const toggle = useRef<boolean>(true);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (toggle?.current) {
            startStream()
        } else {
            stopStream();
        }
    }, [toggle.current])

    useEffect(() => {
        if (showVideo) {
            toggle.current = true;
        } else {
            toggle.current = false
        }
    }, [showVideo])

    return (
        <div className="relative md:fixed md:bottom-4 md:left-4 z-50 w-64 h-48 sm:w-80 sm:h-60 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 rounded-xl shadow-3xl shadow-amber-50 border-0">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full rounded-xl object-cover"
            />

            {/* User label */}
            <div className='absolute top-2 left-2 text-white text-xs font-bold font-poppins bg-black/50 px-1.5 py-0.5 rounded-md'>
                You
            </div>

            {/* Control buttons inside video frame */}
            <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2'>
                <Button
                    onClick={() => toggle.current = !toggle.current}
                    variant={isVideoOn ? "default" : "destructive"}
                    size="icon"
                    className="rounded-full w-8 h-8 bg-black/50 hover:bg-black/70 border border-white/20"
                >
                    {isVideoOn ? <Camera size={14} /> : <CameraOff size={14} />}
                </Button>

                {/* {isAudioOn && (
                    <div className="bg-black/50 rounded-lg p-1 border border-white/20">
                        <VoiceWave voiceStrength={voiceStrength} />
                    </div>
                )} */}
            </div>
        </div>
    );
}

