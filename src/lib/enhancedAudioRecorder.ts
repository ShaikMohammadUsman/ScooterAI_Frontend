// Enhanced audio recording utility for capturing both TTS and user audio during interviews
// This recorder captures the complete conversation flow including AI speech

export interface AudioSegment {
    type: 'tts' | 'user';
    startTime: number;
    endTime: number;
    audioBlob: Blob;
    text?: string;
    duration?: number;
}

export class EnhancedInterviewAudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioStream: MediaStream | null = null;
    private audioSegments: AudioSegment[] = [];
    private isRecording = false;
    private isContinuousRecording = false;
    private startTime = 0;
    private audioContext: AudioContext | null = null;
    private destinationNode: MediaStreamAudioDestinationNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private ttsAudioElement: HTMLAudioElement | null = null;
    private ttsMediaStream: MediaStream | null = null;
    private continuousAudioChunks: Blob[] = [];
    private continuousStartTime = 0;

    constructor() {
        this.audioSegments = [];
    }

    // Initialize audio context and setup for system audio capture
    private async initializeAudioContext(): Promise<void> {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        } catch (error) {
            console.error('Error initializing audio context:', error);
            throw new Error('Failed to initialize audio system');
        }
    }

    // Start continuous recording for the entire interview
    async startContinuousRecording(): Promise<void> {
        try {
            // Guard: run only in browser, secure context, and when API exists
            if (typeof window === 'undefined' || typeof navigator === 'undefined') {
                throw new Error('Audio recording is only available in the browser runtime.');
            }

            await this.initializeAudioContext();

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
                    noiseSuppression: true,
                    autoGainControl: true
                } as MediaTrackConstraints
            });
            
            // Use a widely supported format
            const mimeType = this.getSupportedMimeType();
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, {
                mimeType: mimeType
            });

            this.continuousAudioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.continuousAudioChunks.push(event.data);
                }
            };

            this.continuousStartTime = Date.now();
            this.mediaRecorder.start(1000); // Collect data every second
            this.isContinuousRecording = true;
            
            console.log('Continuous recording started');
        } catch (error) {
            console.error('Error starting continuous recording:', error);
            const message = error instanceof Error ? error.message : 'Unknown recording error';
            throw new Error(message);
        }
    }

    // Stop continuous recording
    stopContinuousRecording(): Blob | null {
        if (this.mediaRecorder && this.isContinuousRecording) {
            try {
                console.log('Stopping continuous recording...');
                this.mediaRecorder.stop();
                this.isContinuousRecording = false;
                
                if (this.continuousAudioChunks.length > 0) {
                    const mimeType = this.getSupportedMimeType();
                    const continuousBlob = new Blob(this.continuousAudioChunks, { type: mimeType });
                    const duration = Date.now() - this.continuousStartTime;
                    console.log(`Continuous recording stopped successfully. Duration: ${duration}ms, Chunks: ${this.continuousAudioChunks.length}, Size: ${continuousBlob.size} bytes`);
                    return continuousBlob;
                } else {
                    console.warn('Continuous recording stopped but no audio chunks were captured');
                }
            } catch (error) {
                console.error('Error stopping continuous recording:', error);
                this.isContinuousRecording = false;
            }
        } else {
            console.log('No active continuous recording to stop');
        }
        return null;
    }

    // Start recording user audio with system audio capture capability (legacy method for per-question recording)
    async startUserRecording(): Promise<void> {
        try {
            // Guard: run only in browser, secure context, and when API exists
            if (typeof window === 'undefined' || typeof navigator === 'undefined') {
                throw new Error('Audio recording is only available in the browser runtime.');
            }

            await this.initializeAudioContext();

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
                    // echoCancellation: true,
                    // noiseSuppression: true,
                    autoGainControl: true
                } as MediaTrackConstraints
            });
            
            // Use a widely supported format
            const mimeType = this.getSupportedMimeType();
            
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
                    audioBlob,
                    duration: Date.now() - this.startTime
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

    // Start capturing TTS audio by creating a virtual audio element
    async startTTSCapture(): Promise<void> {
        try {
            await this.initializeAudioContext();
            
            // Create a virtual audio element for TTS
            this.ttsAudioElement = new Audio();
            this.ttsAudioElement.crossOrigin = 'anonymous';
            
            // Create a media stream destination for capturing audio
            this.destinationNode = this.audioContext!.createMediaStreamDestination();
            
            // Create a gain node to control volume
            const gainNode = this.audioContext!.createGain();
            gainNode.gain.value = 1.0;
            
            // Connect the destination to the gain node
            this.destinationNode.connect(gainNode);
            
            // Store the media stream for recording
            this.ttsMediaStream = this.destinationNode.stream;
            
        } catch (error) {
            console.error('Error starting TTS capture:', error);
            // Don't throw error, just log it - TTS capture is optional
        }
    }

    // Add TTS audio segment with actual audio capture
    async addTTSSegment(text: string, audioData?: ArrayBuffer): Promise<void> {
        const startTime = Date.now();
        
        try {
            let audioBlob: Blob;
            
            if (audioData) {
                // Use the provided audio data
                audioBlob = new Blob([audioData], { type: 'audio/wav' });
            } else {
                // Create a silent segment as fallback
                audioBlob = await this.createSilentAudioSegment(text.length * 50); // Estimate duration
            }
            
            const segment: AudioSegment = {
                type: 'tts',
                startTime: startTime,
                endTime: Date.now(),
                audioBlob,
                text,
                duration: Date.now() - startTime
            };
            this.audioSegments.push(segment);
        } catch (error) {
            console.error('Error adding TTS segment:', error);
            // Add a silent segment as fallback
            const silentBlob = await this.createSilentAudioSegment(1000);
            const segment: AudioSegment = {
                type: 'tts',
                startTime: startTime,
                endTime: Date.now(),
                audioBlob: silentBlob,
                text,
                duration: 1000
            };
            this.audioSegments.push(segment);
        }
    }

    // Create a silent audio segment of specified duration
    private async createSilentAudioSegment(durationMs: number): Promise<Blob> {
        try {
            if (!this.audioContext) {
                await this.initializeAudioContext();
            }
            
            const sampleRate = this.audioContext!.sampleRate;
            const length = Math.floor((durationMs / 1000) * sampleRate);
            const audioBuffer = this.audioContext!.createBuffer(1, length, sampleRate);
            
            // Fill with silence (zeros)
            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < length; i++) {
                channelData[i] = 0;
            }
            
            return this.audioBufferToWav(audioBuffer);
        } catch (error) {
            console.error('Error creating silent audio segment:', error);
            // Return empty blob as last resort
            return new Blob([new ArrayBuffer(0)], { type: 'audio/wav' });
        }
    }

    // Convert AudioBuffer to WAV Blob
    private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
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

    // Get supported MIME type for the current browser
    private getSupportedMimeType(): string {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // Fallback
    }

    // Combine continuous recording with TTS segments into a single file
    async combineAudioSegments(): Promise<File> {
        try {
            // Get the continuous recording blob (only if still recording)
            const continuousBlob = this.isContinuousRecording ? this.stopContinuousRecording() : null;
            
            if (!continuousBlob && this.audioSegments.length === 0) {
                throw new Error('No audio data to combine');
            }

            let finalBlob: Blob;

            if (continuousBlob && this.audioSegments.length > 0) {
                // Mix continuous recording with TTS segments
                finalBlob = await this.mixContinuousWithTTSSegments(continuousBlob);
            } else if (continuousBlob) {
                // Only continuous recording available
                finalBlob = await this.convertToWav(continuousBlob);
            } else {
                // Fallback to segment concatenation
                const sortedSegments = [...this.audioSegments].sort((a, b) => a.startTime - b.startTime);
                const wavSegments = await Promise.all(
                    sortedSegments.map(async (segment) => {
                        if (segment.audioBlob.type === 'audio/wav') {
                            return segment.audioBlob;
                        } else {
                            return await this.convertToWav(segment.audioBlob);
                        }
                    })
                );
                finalBlob = await this.concatenateAudioBlobs(wavSegments);
            }

            // Create final file
            const file = new File([finalBlob], `complete_interview_${Date.now()}.wav`, {
                type: 'audio/wav'
            });

            console.log('Audio combination completed, file size:', file.size, 'bytes');
            return file;
        } catch (error) {
            console.error('Error combining audio segments:', error);
            throw error;
        }
    }

    // Mix continuous recording with TTS segments using Web Audio API
    private async mixContinuousWithTTSSegments(continuousBlob: Blob): Promise<Blob> {
        try {
            if (!this.audioContext) {
                await this.initializeAudioContext();
            }

            // Decode continuous recording
            const continuousArrayBuffer = await continuousBlob.arrayBuffer();
            const continuousAudioBuffer = await this.audioContext!.decodeAudioData(continuousArrayBuffer);

            // Get TTS segments
            const ttsSegments = this.audioSegments.filter(segment => segment.type === 'tts');
            
            if (ttsSegments.length === 0) {
                // No TTS segments, just return continuous recording as WAV
                return this.audioBufferToWav(continuousAudioBuffer);
            }

            // Create a new audio buffer for the mixed result
            const sampleRate = continuousAudioBuffer.sampleRate;
            const numberOfChannels = Math.max(continuousAudioBuffer.numberOfChannels, 1);
            const length = continuousAudioBuffer.length;
            
            const mixedBuffer = this.audioContext!.createBuffer(numberOfChannels, length, sampleRate);

            // Copy continuous recording to mixed buffer
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const continuousData = continuousAudioBuffer.getChannelData(channel);
                const mixedData = mixedBuffer.getChannelData(channel);
                mixedData.set(continuousData);
            }

            // Mix in TTS segments at their respective timestamps
            for (const ttsSegment of ttsSegments) {
                try {
                    const ttsArrayBuffer = await ttsSegment.audioBlob.arrayBuffer();
                    const ttsAudioBuffer = await this.audioContext!.decodeAudioData(ttsArrayBuffer);
                    
                    // Calculate start position based on segment timing
                    const startPosition = Math.floor((ttsSegment.startTime - this.continuousStartTime) / 1000 * sampleRate);
                    
                    // Mix TTS audio into the continuous recording
                    for (let channel = 0; channel < numberOfChannels; channel++) {
                        const mixedData = mixedBuffer.getChannelData(channel);
                        const ttsData = ttsAudioBuffer.getChannelData(Math.min(channel, ttsAudioBuffer.numberOfChannels - 1));
                        
                        for (let i = 0; i < ttsData.length && (startPosition + i) < length; i++) {
                            const mixedIndex = startPosition + i;
                            if (mixedIndex >= 0) {
                                // Mix the audio (simple addition with volume control)
                                mixedData[mixedIndex] = Math.max(-1, Math.min(1, mixedData[mixedIndex] + ttsData[i] * 0.8));
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Failed to mix TTS segment:', error);
                }
            }

            return this.audioBufferToWav(mixedBuffer);
        } catch (error) {
            console.error('Error mixing continuous with TTS segments:', error);
            // Fallback to simple concatenation
            return this.concatenateAudioBlobs([continuousBlob]);
        }
    }

    // Concatenate multiple audio blobs
    private async concatenateAudioBlobs(blobs: Blob[]): Promise<Blob> {
        const arrayBuffers = await Promise.all(
            blobs.map(blob => blob.arrayBuffer())
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

        return new Blob([combinedBuffer], { type: 'audio/wav' });
    }

    // Convert audio to WAV format using Web Audio API
    private async convertToWav(audioBlob: Blob): Promise<Blob> {
        return new Promise((resolve, reject) => {
            try {
                if (!this.audioContext) {
                    reject(new Error('Audio context not initialized'));
                    return;
                }
                
                audioBlob.arrayBuffer().then(arrayBuffer => {
                    this.audioContext!.decodeAudioData(arrayBuffer).then(audioBuffer => {
                        const wavBlob = this.audioBufferToWav(audioBuffer);
                        resolve(wavBlob);
                    }).catch(reject);
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Cleanup resources
    cleanup(): void {
        if (this.mediaRecorder && (this.isRecording || this.isContinuousRecording)) {
            this.mediaRecorder.stop();
        }
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        if (this.ttsMediaStream) {
            this.ttsMediaStream.getTracks().forEach(track => track.stop());
            this.ttsMediaStream = null;
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.ttsAudioElement) {
            this.ttsAudioElement.pause();
            this.ttsAudioElement = null;
        }

        this.audioSegments = [];
        this.continuousAudioChunks = [];
        this.isRecording = false;
        this.isContinuousRecording = false;
        this.destinationNode = null;
        this.sourceNode = null;
    }

    // Get recording status
    getRecordingStatus(): boolean {
        return this.isRecording;
    }

    // Get continuous recording status
    getContinuousRecordingStatus(): boolean {
        return this.isContinuousRecording;
    }

    // Get current recording duration
    getCurrentRecordingDuration(): number {
        if (this.isContinuousRecording && this.continuousStartTime > 0) {
            return Date.now() - this.continuousStartTime;
        }
        return 0;
    }

    // Get segments count
    getSegmentsCount(): number {
        return this.audioSegments.length;
    }

    // Get all segments
    getSegments(): AudioSegment[] {
        return [...this.audioSegments];
    }

    // Get TTS segments only
    getTTSSegments(): AudioSegment[] {
        return this.audioSegments.filter(segment => segment.type === 'tts');
    }

    // Get user segments only
    getUserSegments(): AudioSegment[] {
        return this.audioSegments.filter(segment => segment.type === 'user');
    }
}
