import React from 'react';

interface VoiceWaveProps {
    voiceStrength: number[];
}

export function VoiceWave({ voiceStrength }: VoiceWaveProps) {
    const width = 160;
    const height = 20;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full mx-auto voice-wave rounded-full">
            <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
            <path
                d={voiceStrength.reduce((path, strength, index) => {
                    const x = (index / (voiceStrength.length - 1)) * width;
                    const y = height / 2 + strength * (height / 2);
                    return `${path} L ${x} ${y}`;
                }, `M 0 ${height / 2}`)}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

