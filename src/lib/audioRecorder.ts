// Audio recording utility for capturing both TTS and user audio during interviews

export interface AudioSegment {
    type: 'tts' | 'user';
    startTime: number;
    endTime: number;
    audioBlob: Blob;
    text?: string;
}

export class InterviewAudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioStream: MediaStream | null = null;
    private audioSegments: AudioSegment[] = [];
    private isRecording = false;
    private startTime = 0;

    constructor() {
        this.audioSegments = [];
    }

    // Start recording user audio
    async startUserRecording(): Promise<void> {
        try {
            // Guard: run only in browser, secure context, and when API exists
            if (typeof window === 'undefined' || typeof navigator === 'undefined') {
                throw new Error('Audio recording is only available in the browser runtime.');
            }

            // Some mobile/embedded browsers do not expose mediaDevices or getUserMedia
            const mediaDevices = (navigator as any).mediaDevices as MediaDevices | undefined;
            const legacyGetUserMedia = (navigator as any).getUserMedia as
                | ((constraints: MediaStreamConstraints, success: any, error: any) => void)
                | undefined;

            if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') {
                // Provide a friendly, actionable error message
                throw new Error(
                    'Microphone access is not supported on this device/browser. On iOS Chrome/Firefox, WebKit limitations apply. Please use Chrome on desktop/laptop, and ensure HTTPS.'
                );
            }

            // Request mic with light DSP hints; let the UA pick best sample rate
            this.audioStream = await mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                } as MediaTrackConstraints
            });
            
            // Use a widely supported format
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                ? 'audio/webm;codecs=opus' 
                : 'audio/webm';
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, {
                mimeType: mimeType
            });

            const chunks: Blob[] = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: mimeType });
                const segment: AudioSegment = {
                    type: 'user',
                    startTime: this.startTime,
                    endTime: Date.now(),
                    audioBlob
                };
                this.audioSegments.push(segment);
            };

            this.startTime = Date.now();
            this.mediaRecorder.start();
            this.isRecording = true;
        } catch (error) {
            console.error('Error starting user recording:', error);
            // Re-throw with a normalized, user-friendly message
            const message = error instanceof Error ? error.message : 'Unknown recording error';
            throw new Error(message);
        }
    }

    // Stop recording user audio
    stopUserRecording(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    // Add TTS audio segment (simplified - we'll use a placeholder for now)
    addTTSSegment(text: string): void {
        // Create a silent audio segment for TTS (we'll improve this later)
        const silentBlob = new Blob([new ArrayBuffer(0)], { type: 'audio/wav' });
        const segment: AudioSegment = {
            type: 'tts',
            startTime: Date.now(),
            endTime: Date.now(),
            audioBlob: silentBlob,
            text
        };
        this.audioSegments.push(segment);
    }

    // Convert audio to WAV format using a simple approach
    private async convertToWav(audioBlob: Blob): Promise<Blob> {
        return new Promise((resolve, reject) => {
            try {
                const audioContext = new AudioContext();
                
                audioBlob.arrayBuffer().then(arrayBuffer => {
                    audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
                        // Create a simple WAV file
                        const wavBlob = this.createWavFile(audioBuffer);
                        resolve(wavBlob);
                    }).catch(reject);
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Create WAV file from AudioBuffer
    private createWavFile(audioBuffer: AudioBuffer): Blob {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;
        
        // Calculate buffer size
        const bufferSize = 44 + length * numChannels * 2;
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);
        
        // Write WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, bufferSize - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numChannels * 2, true);
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    }

    // Combine all audio segments into a single audio file
    async combineAudioSegments(): Promise<File> {
        if (this.audioSegments.length === 0) {
            throw new Error('No audio segments to combine');
        }

        try {
            // For now, we'll just combine the user audio segments
            const userSegments = this.audioSegments.filter(segment => segment.type === 'user');
            
            if (userSegments.length === 0) {
                throw new Error('No user audio segments to combine');
            }

            // If there's only one segment, convert it to WAV and return
            if (userSegments.length === 1) {
                const wavBlob = await this.convertToWav(userSegments[0].audioBlob);
                const file = new File([wavBlob], `interview_${Date.now()}.wav`, {
                    type: 'audio/wav'
                });
                return file;
            }

            // For multiple segments, we need to combine them first
            // This is a simplified approach - in production you'd want proper audio concatenation
            const arrayBuffers = await Promise.all(
                userSegments.map(segment => segment.audioBlob.arrayBuffer())
            );

            // Calculate total size
            const totalSize = arrayBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);
            
            // Create a new array buffer to hold all data
            const combinedBuffer = new ArrayBuffer(totalSize);
            const combinedView = new Uint8Array(combinedBuffer);
            
            // Copy all data into the combined buffer
            let offset = 0;
            for (const arrayBuffer of arrayBuffers) {
                const view = new Uint8Array(arrayBuffer);
                combinedView.set(view, offset);
                offset += arrayBuffer.byteLength;
            }

            // Create blob from combined buffer and convert to WAV
            const combinedBlob = new Blob([combinedBuffer], { type: 'audio/webm;codecs=opus' });
            const wavBlob = await this.convertToWav(combinedBlob);
            
            const file = new File([wavBlob], `interview_${Date.now()}.wav`, {
                type: 'audio/wav'
            });

            return file;
        } catch (error) {
            console.error('Error combining audio segments:', error);
            throw error;
        }
    }

    // Cleanup resources
    cleanup(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        this.audioSegments = [];
        this.isRecording = false;
    }

    // Get recording status
    getRecordingStatus(): boolean {
        return this.isRecording;
    }

    // Get segments count
    getSegmentsCount(): number {
        return this.audioSegments.length;
    }

    // Get all segments
    getSegments(): AudioSegment[] {
        return [...this.audioSegments];
    }
} 