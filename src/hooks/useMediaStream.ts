import { useState, useEffect, useCallback } from 'react';

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [voiceStrength, setVoiceStrength] = useState<number[]>(new Array(50).fill(0));

  const startStream = useCallback(async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(newStream);
      setIsVideoOn(true);
      setIsAudioOn(true);

      // Set up voice activity detection
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(newStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVoiceActivity = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setVoiceStrength(prevStrength => [...prevStrength.slice(1), average / 128]);
        requestAnimationFrame(checkVoiceActivity);
      };

      audioSource.connect(analyser);
      checkVoiceActivity();
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoOn(false);
      setIsAudioOn(false);
      setVoiceStrength(new Array(50).fill(0));
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  }, [stream]);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return { stream, isVideoOn, isAudioOn, voiceStrength, startStream, stopStream, toggleVideo, toggleAudio };
}

