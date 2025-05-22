import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { VoiceWave } from './VoiceWave';
import { useMediaStream } from '@/hooks/useMediaStream';


export function UserVideo() {
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

    return (
        // <div className="fixed bottom-2 right-2 md:right-12 z-[102] w-48 md:w-64 max-w-md mx-auto bg-gray-800 rounded-lg">
        // <div className="relative w-80 h-48 sm:w-96 sm:h-96 border-2 shadow-md max-w-md  bg-gradient-to-r from-blue-900 via-gray-900 to-gray-500 rounded-lg">
        <div className="relative w-full h-full border-2 shadow-md  bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 rounded-lg">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full rounded-2xl shadow-lg "
            />
            <div className='absolute top-2 left-2 text-muted text-md font-bold font-poppins'>You</div>

            <div className='absolute bottom-0 w-full flex  gap-2 justify-around p-2 px-4  mx-auto'>
                <div className="relative -top-1/2 transform -translate-1/2 flex justify-center space-x-4">
                    <Button
                        onClick={() => toggle.current = !toggle.current}
                        variant={isVideoOn ? "default" : "destructive"}
                        size="icon"
                        className="rounded-full hover:bg-blue-100 hover:text-gray-600 hover:scale-110"
                    >
                        {isVideoOn ? <Camera size={20} /> : <CameraOff size={20} />}
                    </Button>
                </div>
                {isAudioOn && (
                    <div className="w-1/2 bg-black bg-opacity-50 rounded-lg p-2">
                        <VoiceWave voiceStrength={voiceStrength} />
                    </div>
                )}
            </div>
        </div>
    );
}

