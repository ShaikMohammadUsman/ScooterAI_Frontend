"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { UserVideo } from './components/UserVideo';
import { startConversationalInterview, continueConversationalInterview, videoInterviewLogin, updateVideoProctoringLogs } from '@/lib/interviewService';
import { textInAudioOut } from '@/lib/voiceBot';
import { AzureChunkedUploader, createChunkedUploader } from '@/lib/azureChunkedUploader';


import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaShieldAlt, FaEnvelope, FaKey, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingDots } from "@/components/ui/loadingDots";
import { SubmissionModal } from "./components/SubmissionModal";
import { ResumeUploadModal } from "./components/ResumeUploadModal";
import { toast } from "@/hooks/use-toast";
import WelcomeScreen from "@/components/interview/WelcomeScreen";
import ProctoringSystem, { ProctoringSystemRef, ProctoringData } from "@/components/interview/ProctoringSystem";
import InterviewControls from "@/components/interview/InterviewControls";
import ChatPanel from "@/components/interview/ChatPanel";
import QuestionPalette from "@/components/interview/QuestionPalette";
import AISpeakingAnimation from "@/components/interview/AISpeakingAnimation";
import BrowserWarningModal from "@/components/interview/BrowserWarningModal";
// import { useMediaStream } from '@/hooks/useMediaStream';

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;
// Dev/preview flag to bypass verification without removing functionality
const BYPASS_VIDEO_VERIFICATION = process?.env?.NEXT_PUBLIC_BYPASS_VIDEO_VERIFICATION === 'true';

// Utility function to get the best supported video format
const getBestSupportedVideoFormat = () => {
    // Priority order:
    // 1) MP4 H.264 High/Main/Baseline + AAC-LC
    // 2) Generic MP4 fallbacks
    // 3) WebM H.264/Opus, VP9/Opus, AV1/Opus, generic WebM
    const formats = [
        // MP4 preferred variants (video+audio)
        { mimeType: 'video/mp4;codecs=h264,aac', fileExtension: 'mp4', description: 'MP4 H.264/AAC' },
        { mimeType: 'video/mp4;codecs="avc1.64001F, mp4a.40.2"', fileExtension: 'mp4', description: 'MP4 H.264 High + AAC-LC' },
        { mimeType: 'video/mp4;codecs="avc1.4D401E, mp4a.40.2"', fileExtension: 'mp4', description: 'MP4 H.264 Main + AAC-LC' },
        { mimeType: 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"', fileExtension: 'mp4', description: 'MP4 H.264 Baseline + AAC-LC' },
        // Generic MP4 fallbacks (let browser choose profiles)
        { mimeType: 'video/mp4;codecs=avc1', fileExtension: 'mp4', description: 'MP4 H.264 (unspecified profile), audio decided by UA' },
        { mimeType: 'video/mp4', fileExtension: 'mp4', description: 'MP4 (container only, codecs decided by UA)' },
        // WebM variants
        { mimeType: 'video/webm;codecs=h264,opus', fileExtension: 'webm', description: 'WebM H.264/Opus' },
        { mimeType: 'video/webm;codecs=vp9,opus', fileExtension: 'webm', description: 'WebM VP9/Opus' },
        { mimeType: 'video/webm;codecs=av1,opus', fileExtension: 'webm', description: 'WebM AV1/Opus' },
        { mimeType: 'video/webm', fileExtension: 'webm', description: 'WebM (default)' }
    ];

    for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format.mimeType)) {
            console.log(`Using video format: ${format.description}`);
            return format;
        }
    }

    // Fallback to default WebM if nothing else is supported
    console.warn('No preferred video formats supported, using default WebM');
    return { mimeType: 'video/webm', fileExtension: 'webm', description: 'WebM (default)' };
};

function CommunicationInterview() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode; status?: 'completed' | 'retaken'; loading?: boolean; isIntroduction?: boolean }[]>([]);
    const [micEnabled, setMicEnabled] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEndingInterview, setIsEndingInterview] = useState(false);
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'submitting' | 'processing' | 'uploading'>('submitting');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [cameraAccessDenied, setCameraAccessDenied] = useState(false);
    const [showCameraRetry, setShowCameraRetry] = useState(false);

    // Comprehensive permission checking states
    const [permissionStatus, setPermissionStatus] = useState<{
        camera: 'checking' | 'granted' | 'denied' | 'not-requested';
        microphone: 'checking' | 'granted' | 'denied' | 'not-requested';
        screenShare: 'checking' | 'granted' | 'denied' | 'not-requested';
        screenAudio: 'checking' | 'granted' | 'denied' | 'not-requested';
    }>({
        camera: 'not-requested',
        microphone: 'not-requested',
        screenShare: 'not-requested',
        screenAudio: 'not-requested'
    });
    const [showPermissionChecker, setShowPermissionChecker] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isProcessingFinalResponse, setIsProcessingFinalResponse] = useState(false);
    const [speechDuration, setSpeechDuration] = useState<number>(0);
    // System audio availability hint (shown for macOS Chrome or when permission denied)
    const [systemAudioHint, setSystemAudioHint] = useState<string | null>(null);
    const [systemAudioPrompted, setSystemAudioPrompted] = useState<boolean>(false);

    // Interview event timestamps
    const [interviewEvents, setInterviewEvents] = useState<Array<{
        event: string;
        timestamp: Date;
        details?: any;
    }>>([]);

    // Add interview event with timestamp
    const addInterviewEvent = (event: string, details?: any) => {
        const newEvent = {
            event,
            timestamp: new Date(),
            details
        };
        setInterviewEvents(prev => [...prev, newEvent]);
        // console.log(`Video Interview Event: ${event}`, newEvent);
    };

    const recognizerRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const recordingFormatRef = useRef<{ fileExtension: string; mimeType: string }>({ fileExtension: 'mp4', mimeType: 'video/mp4;codecs=h264,aac' });
    const chunkedUploaderRef = useRef<AzureChunkedUploader | null>(null);
    // Additional refs for progressive system-audio capture
    const displayAudioStreamRef = useRef<MediaStream | null>(null);
    const userMediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const systemAudioAttemptedRef = useRef<boolean>(false);
    // Pre-acquire system audio at camera check time to avoid re-prompt later
    const requestSystemAudioEarly = async () => {
        systemAudioAttemptedRef.current = true;
        if (displayAudioStreamRef.current && displayAudioStreamRef.current.getAudioTracks().length) {
            console.log('[Recording] System audio already acquired early');
            return;
        }
        if (typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
            console.log('[Recording] getDisplayMedia not supported in this browser');
            return;
        }
        console.log('[Recording] Early request for system audio via getDisplayMedia({ video: true, audio: true })');
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (!stream.getAudioTracks().length) {
                console.warn('[Recording] Early system audio stream has 0 audio tracks');
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            // Keep this stream alive for later use; disable its video track to reduce overhead
            stream.getVideoTracks().forEach(t => { try { t.enabled = false; } catch { } });
            displayAudioStreamRef.current = stream;
            setSystemAudioHint(null);
            console.log('[Recording] Early system audio acquired');
        } catch (e: any) {
            console.warn('[Recording] Early system audio request failed:', e?.name || e, e?.message || '');
            if (!systemAudioPrompted) {
                try {
                    toast({
                        title: 'Allow system audio to be included',
                        description: 'Please allow screen sharing and ensure "Share audio" is checked to include narration in the recording.',
                        variant: 'warning'
                    });
                } catch { }
                setSystemAudioHint('System audio permission was not granted. You can allow it when prompted to include narration in the recording.');
                setSystemAudioPrompted(true);
            }
        }
    };


    // Verification states
    const [showVerification, setShowVerification] = useState(false);
    const [showUnauthorized, setShowUnauthorized] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [email, setEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedUser, setVerifiedUser] = useState<{ user_id: string; full_name: string; resume_status: boolean; reset_count: number } | null>(null);
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState<string | null>(null);

    // Resume upload states
    const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);

    // Welcome screen state
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

    // Proctoring states
    const [proctoringActive, setProctoringActive] = useState(false);
    const [proctoringViolations, setProctoringViolations] = useState<string[]>([]);
    const proctoringRef = useRef<ProctoringSystemRef>(null);

    // Theme transition state
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [showBrowserWarning, setShowBrowserWarning] = useState(false);

    // Control states
    const [showChat, setShowChat] = useState(false);

    // Retake functionality
    const [currentAnswer, setCurrentAnswer] = useState(""); // Track current answer for retake
    const [retakeCount, setRetakeCount] = useState<number[]>([]);
    const [isRetaking, setIsRetaking] = useState(false); // Track if user is currently retaking

    // Track current question index for retake counting
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Track whether the current visible question is the final one (server signaled step "done")
    const [isFinalQuestion, setIsFinalQuestion] = useState(false);

    // Media stream for camera functionality
    // const { isVideoOn, toggleVideo } = useMediaStream();
    const [showVideo, setShowVideo] = useState(true);

    // Check for verification parameter on mount (with optional bypass)
    useEffect(() => {
        // If bypass flag is enabled, set a dummy verified user and skip verification UI
        if (BYPASS_VIDEO_VERIFICATION) {
            const userId = localStorage.getItem('scooterUserId');
            setVerifiedUser({ user_id: userId || '', full_name: 'Developer', resume_status: true, reset_count: 0 });
            setShowVerification(false);
            setShowUnauthorized(false);
            // Trigger dark theme transition for consistency
            setTimeout(() => setIsDarkTheme(true), 100);
            return;
        }

        const verifyCode = searchParams.get('verify');

        if (!verifyCode) {
            setShowUnauthorized(true);
        } else if (!/^[A-Za-z0-9]{5}$/.test(verifyCode)) {
            setShowUnauthorized(true);
        } else {
            setVerificationCode(verifyCode);
            setShowVerification(true);
        }
    }, [searchParams]);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupRecording();
            if (recognizerRef.current) {
                recognizerRef.current.stopContinuousRecognitionAsync();
            }
            // Deactivate proctoring on unmount
            setProctoringActive(false);
        };
    }, []);

    // Detect non-Chrome browsers and show warning once on mount
    useEffect(() => {
        const ua = navigator.userAgent || "";
        const uaData = (navigator as any).userAgentData;
        let isRealChrome = false;
        if (uaData && Array.isArray(uaData.brands)) {
            const brands = uaData.brands as Array<{ brand: string; version: string }>;
            const hasGoogleChrome = brands.some(b => /Google Chrome/i.test(b.brand));
            const hasEdge = brands.some(b => /Microsoft Edge/i.test(b.brand));
            const hasOpera = brands.some(b => /Opera|OPR/i.test(b.brand));
            const isBrave = (navigator as any).brave ? true : false;
            isRealChrome = hasGoogleChrome && !hasEdge && !hasOpera && !isBrave;
        } else {
            const hasChrome = /Chrome\//.test(ua);
            const isEdge = /Edg\//.test(ua);
            const isOpera = /OPR\//.test(ua);
            const isBrave = (navigator as any).brave ? true : false;
            isRealChrome = hasChrome && !isEdge && !isOpera && !isBrave;
        }
        if (!isRealChrome) {
            setShowBrowserWarning(true);
        }
    }, []);

    // Handle proctoring violations
    const handleProctoringViolation = (violation: string) => {
        setProctoringViolations(prev => [...prev, violation]);
        // toast({
        //     title: "Proctoring Alert",
        //     description: violation,
        //     variant: "destructive",
        // });
        // Track silently without showing a toast to avoid UI interruptions
    };

    // Handle verification
    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !verificationCode.trim()) {
            setVerificationError("Please enter both email and verification code");
            return;
        }

        setIsVerifying(true);
        setVerificationError(null);

        try {
            const response = await videoInterviewLogin({
                email: email.trim(),
                code: verificationCode.trim()
            });

            if (response.status) {
                setVerifiedUser({
                    user_id: response.user_id!,
                    full_name: response.full_name!,
                    resume_status: response.resume_status || false,
                    reset_count: response.reset_count || 0
                });
                setJobTitle(response.job_title || null);
                setJobDescription(response.job_description || null);
                setShowVerification(false);

                // Trigger dark theme transition after successful verification
                setTimeout(() => {
                    setIsDarkTheme(true);
                }, 500); // Small delay for smooth transition

                // Check if resume needs to be updated
                if (!response.resume_status) {
                    setShowResumeUploadModal(true);
                    toast({
                        title: "Resume Update Required",
                        description: "Please upload your latest resume to continue with the interview.",
                        variant: "warning"
                    });
                } else {
                    toast({
                        title: "Verification successful!",
                        description: `Welcome, ${response.full_name}! You can now proceed with the interview.`,
                        variant: "success"
                    });
                }
            } else {
                setVerificationError(response.message);
            }
        } catch (err: any) {
            setVerificationError(err.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    // Start interview with camera check
    const handleStart = async (skipPermissionCheck = false) => {
        setShowWelcomeScreen(false);
        setLoading(true);
        setError(null);
        const userId = verifiedUser?.user_id || localStorage.getItem('scooterUserId');
        if (!userId) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }

        try {
            // Check all required permissions first (unless already checked)
            if (!skipPermissionCheck) {
                const allPermissionsGranted = await checkAllPermissions();
                if (!allPermissionsGranted) {
                    setLoading(false);
                    return; // Stay on permission checker screen
                }
            }

            // All permissions granted, proceed with interview
            setShowPermissionChecker(false);

            // Activate proctoring when camera check starts
            setProctoringActive(true);
            addInterviewEvent('video_interview_started', { timestamp: new Date() });

            // Wait for proctoring to be fully activated before proceeding
            await new Promise(resolve => setTimeout(resolve, 100));

            // Early prompt for system audio permission to avoid later interruption
            await requestSystemAudioEarly();

            // Start with a test question for camera check
            // const testQuestion = `Hi, how are you? Please click 'Start Interview' to begin. I'll be asking you some questions that will reflect real-life scenarios you may encounter in the role${jobTitle ? ` of ${jobTitle}` : ""}${jobTitle && jobDescription ? ` at ${jobDescription}` : ""}.`;
            const testQuestion = `Hi, how are you? Please click 'Start Interview' to begin. I'll be asking you some questions that will reflect real-life scenarios you may encounter in your role${jobTitle ? ` of ${jobTitle}` : ""}.`;
            setCurrentQuestion(testQuestion);
            setMessages([{
                own: false,
                text: testQuestion,
                icon: <FaUserTie className="text-primary w-6 h-6" />,
                isIntroduction: true
            }]);

            // Speak the test question
            const duration = await textInAudioOut(
                testQuestion,
                (spokenText) => {
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && !lastMessage.own) {
                            lastMessage.text = spokenText;
                        }
                        return newMessages;
                    });
                },
                setLoading,
                setIsSpeaking
            );
            setSpeechDuration(duration);

            setStarted(true);
            setMicEnabled(true);
        } catch (err: any) {
            console.error("Error starting interview:", err);
            setError(err.message || "Failed to start interview");
            // Deactivate proctoring on error
            setProctoringActive(false);
        } finally {
            setLoading(false);
        }
    };

    // Comprehensive permission checker
    const checkAllPermissions = async (): Promise<boolean> => {
        setShowPermissionChecker(true);
        setPermissionError(null);

        // Reset all permissions to checking
        setPermissionStatus({
            camera: 'checking',
            microphone: 'checking',
            screenShare: 'checking',
            screenAudio: 'checking'
        });

        let allPermissionsGranted = true;

        // 1. Check Camera Permission
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStream.getTracks().forEach(track => track.stop());
            setPermissionStatus(prev => ({ ...prev, camera: 'granted' }));
        } catch (err: any) {
            console.error("Camera permission error:", err);
            setPermissionStatus(prev => ({ ...prev, camera: 'denied' }));
            allPermissionsGranted = false;
        }

        // 2. Check Microphone Permission
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream.getTracks().forEach(track => track.stop());
            setPermissionStatus(prev => ({ ...prev, microphone: 'granted' }));
        } catch (err: any) {
            console.error("Microphone permission error:", err);
            setPermissionStatus(prev => ({ ...prev, microphone: 'denied' }));
            allPermissionsGranted = false;
        }

        // 3. Check Screen Share Permission (with audio)
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Check if audio tracks are present (system audio)
            const audioTracks = screenStream.getAudioTracks();
            if (audioTracks.length > 0) {
                setPermissionStatus(prev => ({
                    ...prev,
                    screenShare: 'granted',
                    screenAudio: 'granted'
                }));
                // Persist this stream for later recording to avoid re-prompting
                try { screenStream.getVideoTracks().forEach(t => { try { t.enabled = false; } catch { } }); } catch { }
                displayAudioStreamRef.current = screenStream;
                systemAudioAttemptedRef.current = true;
            } else {
                setPermissionStatus(prev => ({
                    ...prev,
                    screenShare: 'granted',
                    screenAudio: 'denied'
                }));
                // No usable audio, stop the stream
                try { screenStream.getTracks().forEach(track => track.stop()); } catch { }
                allPermissionsGranted = false;
            }
        } catch (err: any) {
            console.error("Screen share permission error:", err);
            setPermissionStatus(prev => ({
                ...prev,
                screenShare: 'denied',
                screenAudio: 'denied'
            }));
            allPermissionsGranted = false;
        }

        if (!allPermissionsGranted) {
            setPermissionError("Some permissions are missing. Please grant all required permissions to continue.");
        } else {
            // Clear any previous errors when all permissions are granted
            setPermissionError(null);
        }

        return allPermissionsGranted;
    };

    // Handle individual permission retry
    const retryPermission = async (permissionType: 'camera' | 'microphone' | 'screenShare' | 'screenAudio') => {
        setPermissionError(null);

        try {
            if (permissionType === 'camera') {
                setPermissionStatus(prev => ({ ...prev, camera: 'checking' }));
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStream.getTracks().forEach(track => track.stop());
                setPermissionStatus(prev => ({ ...prev, camera: 'granted' }));
                // Check if all permissions are now granted
                setTimeout(() => {
                    setPermissionStatus(current => {
                        if (current.camera === 'granted' && current.microphone === 'granted' &&
                            current.screenShare === 'granted' && current.screenAudio === 'granted') {
                            setPermissionError(null);
                        }
                        return current;
                    });
                }, 100);
            } else if (permissionType === 'microphone') {
                setPermissionStatus(prev => ({ ...prev, microphone: 'checking' }));
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStream.getTracks().forEach(track => track.stop());
                setPermissionStatus(prev => ({ ...prev, microphone: 'granted' }));
                // Check if all permissions are now granted
                setTimeout(() => {
                    setPermissionStatus(current => {
                        if (current.camera === 'granted' && current.microphone === 'granted' &&
                            current.screenShare === 'granted' && current.screenAudio === 'granted') {
                            setPermissionError(null);
                        }
                        return current;
                    });
                }, 100);
            } else if (permissionType === 'screenShare' || permissionType === 'screenAudio') {
                setPermissionStatus(prev => ({
                    ...prev,
                    screenShare: 'checking',
                    screenAudio: 'checking'
                }));
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                const audioTracks = screenStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    setPermissionStatus(prev => ({
                        ...prev,
                        screenShare: 'granted',
                        screenAudio: 'granted'
                    }));
                    // Check if all permissions are now granted
                    setTimeout(() => {
                        setPermissionStatus(current => {
                            if (current.camera === 'granted' && current.microphone === 'granted' &&
                                current.screenShare === 'granted' && current.screenAudio === 'granted') {
                                setPermissionError(null);
                            }
                            return current;
                        });
                    }, 100);
                } else {
                    setPermissionStatus(prev => ({
                        ...prev,
                        screenShare: 'granted',
                        screenAudio: 'denied'
                    }));
                    setPermissionError("Screen sharing granted but system audio was not enabled. Please make sure to check 'Share system audio' when sharing your screen.");
                }
                // Persist this stream for later recording to avoid re-prompting
                try { screenStream.getVideoTracks().forEach(t => { try { t.enabled = false; } catch { } }); } catch { }
                displayAudioStreamRef.current = screenStream;
                systemAudioAttemptedRef.current = true;
            }
        } catch (err: any) {
            console.error(`${permissionType} permission error:`, err);
            setPermissionStatus(prev => ({ ...prev, [permissionType]: 'denied' }));
            setPermissionError(`Failed to get ${permissionType} permission. Please try again.`);
        }
    };

    // Legacy camera access function (for backward compatibility)
    const checkCameraAccess = async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // If we get here, access was granted
            stream.getTracks().forEach(track => track.stop()); // Clean up test stream
            setCameraAccessDenied(false);
            setShowCameraRetry(false);
            return true;
        } catch (err: any) {
            console.error("Camera access error:", err);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraAccessDenied(true);
                setShowCameraRetry(true);
                setError("Camera access denied. Please allow camera and microphone access to continue with the interview.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("No camera or microphone found. Please connect a camera and microphone to continue.");
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError("Camera or microphone is already in use by another application. Please close other applications using the camera.");
            } else {
                setError("Failed to access camera and microphone. Please check your device settings.");
            }

            return false;
        }
    };

    // Build a combined media stream that includes camera video, mic audio, and system audio (if supported)
    const getCombinedMediaStream = async (): Promise<MediaStream> => {
        // Always acquire user's camera + mic first (widest support)
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userMediaStreamRef.current = userMedia;

        // Try to use any early-acquired system audio. If not present, acquire now only if not attempted before.
        let displayAudio: MediaStream | null = displayAudioStreamRef.current || null;
        console.log('[Recording] Preparing system audio for combined stream');
        try {
            const hasLiveAudio = !!displayAudio && displayAudio.getAudioTracks().some(t => t.readyState === 'live');
            if (!hasLiveAudio) {
                if (systemAudioAttemptedRef.current) {
                    console.log('[Recording] System audio already attempted earlier; will not re-prompt');
                    displayAudio = null;
                } else {
                    console.log('[Recording] Trying to capture system audio with getDisplayMedia({ video: true, audio: true })');
                    systemAudioAttemptedRef.current = true;
                    // Request video+audio to ensure the picker shows the "Share audio" option widely
                    displayAudio = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                }
            }
            // If stream has no audio tracks, treat as unsupported
            if (!displayAudio || !displayAudio.getAudioTracks().length) {
                console.warn('[Recording] System audio stream acquired but contains 0 audio tracks');
                if (displayAudio) { displayAudio.getTracks().forEach(t => t.stop()); }
                displayAudio = null;
            } else {
                console.log('[Recording] System audio track acquired');
                displayAudioStreamRef.current = displayAudio;
                // Do not stop the display video track; disabling is safer to keep audio alive
                try { displayAudio.getVideoTracks().forEach(t => { try { t.enabled = false; } catch { } }); } catch { }
            }
        } catch (e: any) {
            // System audio not available or permission denied — proceed without it
            const supported = typeof navigator.mediaDevices.getDisplayMedia === 'function';
            console.warn('[Recording] System audio preparation failed:', e?.name || e, e?.message || '');
            if (supported && !systemAudioPrompted && !systemAudioAttemptedRef.current) {
                // Likely permission denied or "Share audio" unchecked in picker
                try {
                    toast({
                        title: 'Allow system audio to be included',
                        description: 'Please allow screen sharing and ensure "Share audio" is checked to include narration in the recording.',
                        variant: 'warning'
                    });
                } catch { }
                setSystemAudioHint('System audio permission was not granted. Please allow screen sharing with "Share audio" enabled.');
                setSystemAudioPrompted(true);
            }
            displayAudio = null;
        }

        // If no system audio, just return the original user media stream
        if (!displayAudio) {
            // Detect macOS Chrome and show guidance to enable flag and share audio
            try {
                const ua = navigator.userAgent || '';
                const isMac = /Macintosh|Mac OS X/.test(ua);
                const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
                if (isMac && isChrome) {
                    setSystemAudioHint(
                        'System audio is not available. On macOS Chrome, enable chrome://flags/#mac-system-audio-loopback, restart Chrome, and when sharing, check "Share audio".'
                    );
                }
            } catch { }
            console.log('[Recording] Proceeding with mic-only audio (system audio unavailable)');
            return userMedia;
        }

        // Mix mic + system audio into a single track with light processing to avoid clipping
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const destinationNode = audioContext.createMediaStreamDestination();
        const micSource = audioContext.createMediaStreamSource(userMedia);
        const systemSource = audioContext.createMediaStreamSource(displayAudio);

        micSource.connect(destinationNode);
        systemSource.connect(destinationNode);
        // // Create gain nodes to balance levels
        // const micGain = audioContext.createGain();
        // micGain.gain.value = 0.9; // slight reduction to avoid peaking
        // const systemGain = audioContext.createGain();
        // systemGain.gain.value = 0.9;

        // // Dynamics compressor to tame loud peaks without distorting
        // const compressor = audioContext.createDynamicsCompressor();
        // compressor.threshold.setValueAtTime(-18, audioContext.currentTime);
        // compressor.knee.setValueAtTime(30, audioContext.currentTime);
        // compressor.ratio.setValueAtTime(4, audioContext.currentTime);
        // compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
        // compressor.release.setValueAtTime(0.25, audioContext.currentTime);

        // // Wire graph: mic->micGain ->\
        // //                     \       -> compressor -> destination
        // //            system->systemGain /
        // micSource.connect(micGain);
        // systemSource.connect(systemGain);
        // micGain.connect(compressor);
        // systemGain.connect(compressor);
        // compressor.connect(destinationNode);

        // Build final combined stream: camera video + mixed audio
        const combined = new MediaStream();
        userMedia.getVideoTracks().forEach(track => combined.addTrack(track));
        destinationNode.stream.getAudioTracks().forEach(track => combined.addTrack(track));
        console.log('[Recording] Using combined stream with camera video + mixed mic+system audio');
        return combined;
    };

    // Start video recording
    const startRecording = async () => {
        try {
            const combinedStream = await getCombinedMediaStream();
            videoStreamRef.current = combinedStream;

            // Get the best supported video format
            const format = getBestSupportedVideoFormat();

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: format.mimeType
            });

            // Store format info in ref for later use
            recordingFormatRef.current = { fileExtension: format.fileExtension, mimeType: format.mimeType };

            // Initialize chunked uploader
            const userId = verifiedUser?.user_id || localStorage.getItem('scooterUserId');
            if (!userId) {
                throw new Error("No user ID found for video upload");
            }

            const resetCount = (verifiedUser?.reset_count || 0);
            // console.log('Using reset_count for filename:', {
            //     originalResetCount: verifiedUser?.reset_count || 0,
            //     incrementedResetCount: resetCount
            // });

            const uploader = createChunkedUploader({
                userId,
                fileExtension: format.fileExtension,
                resetCount: resetCount,
                onProgress: (uploadedBytes) => {
                    // Update progress (we'll estimate total based on time elapsed)
                    const estimatedTotal = uploadedBytes * 2; // Rough estimate
                    const progress = Math.min(uploadedBytes / estimatedTotal, 0.95); // Cap at 95% until finalization
                    setUploadProgress(progress);
                },
                onError: (error) => {
                    console.error('Chunked upload error:', error);
                    toast({
                        title: "Upload Error",
                        description: "Failed to upload video chunk. Please check your connection.",
                        variant: "destructive",
                    });
                },
                onComplete: (blobUrl) => {
                    console.log('Video upload completed:', blobUrl);
                    setUploadProgress(1);
                }
            });

            chunkedUploaderRef.current = uploader;

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    // Upload chunk immediately instead of buffering
                    try {
                        await uploader.enqueueChunk(event.data);
                    } catch (error) {
                        console.error('Failed to upload chunk:', error);
                        // Continue recording even if chunk upload fails
                    }
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = []; // Keep for fallback if needed
            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Failed to start video recording");
        }
    };

    // Stop video recording
    const stopRecording = async (): Promise<{ blobUrl: string; fileExtension: string; mimeType: string }> => {
        return new Promise(async (resolve, reject) => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.onstop = async () => {
                    const { fileExtension, mimeType } = recordingFormatRef.current;

                    try {
                        // Finalize the chunked upload
                        if (chunkedUploaderRef.current) {
                            const blobUrl = await chunkedUploaderRef.current.finalize();
                            resolve({ blobUrl, fileExtension, mimeType });
                        } else {
                            // Fallback: create blob from buffered chunks if uploader failed
                            const blob = new Blob(recordedChunksRef.current, {
                                type: mimeType
                            });
                            // This is a fallback - we'd need to upload this blob separately
                            reject(new Error("Chunked uploader not available and fallback blob creation not implemented"));
                        }
                    } catch (error) {
                        console.error("Error finalizing upload:", error);
                        reject(error);
                    }
                };
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            } else {
                reject(new Error("No active recording to stop"));
            }
        });
    };

    // Cleanup recording
    const cleanupRecording = () => {
        if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
            videoStreamRef.current = null;
        }
        if (userMediaStreamRef.current) {
            userMediaStreamRef.current.getTracks().forEach(track => track.stop());
            userMediaStreamRef.current = null;
        }
        if (displayAudioStreamRef.current) {
            displayAudioStreamRef.current.getTracks().forEach(track => track.stop());
            displayAudioStreamRef.current = null;
        }
        if (audioContextRef.current) {
            try { audioContextRef.current.close(); } catch { }
            audioContextRef.current = null;
        }
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
        if (chunkedUploaderRef.current) {
            chunkedUploaderRef.current.abort();
            chunkedUploaderRef.current = null;
        }
        setIsRecording(false);
    };

    // Reset camera access states
    const resetCameraStates = () => {
        setCameraAccessDenied(false);
        setShowCameraRetry(false);
        setError(null);
    };

    // Start actual interview after camera check
    const startActualInterview = async () => {
        setLoading(true);
        setIsProcessingResponse(true);
        setError(null);
        const userId = verifiedUser?.user_id || localStorage.getItem('scooterUserId');
        if (!userId) {
            setError("No profile ID found");
            setLoading(false);
            setIsProcessingResponse(false);
            return;
        }

        try {
            // Check camera access first
            const hasCameraAccess = await checkCameraAccess();
            if (!hasCameraAccess) {
                setLoading(false);
                setIsProcessingResponse(false);
                return;
            }

            // Start video recording
            await startRecording();

            const res = await startConversationalInterview({
                role: "communication",
                user_id: userId,
                flag: "start"
            });

            setSessionId(res.session_id);
            if (res.question) {
                setCurrentQuestion(res.question);
            }

            // If server marks the shown question as the final one
            // setIsFinalQuestion(res.step === 'done');

            // Initialize retake tracking for the first question
            setRetakeCount([0]);
            setCurrentQuestionIndex(0);

            // Add loading message
            setMessages((prev) => [...prev, {
                own: false,
                text: "",
                icon: <FaUserTie className="text-primary w-6 h-6" />,
                loading: true
            }]);

            // Speak the question
            if (res.question) {
                // Track question narration start
                handleQuestionNarrationStart(0, res.question);

                const duration = await textInAudioOut(
                    res.question,
                    (spokenText) => {
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && !lastMessage.own) {
                                lastMessage.text = spokenText;
                                lastMessage.loading = false;
                            }
                            return newMessages;
                        });
                    },
                    setLoading,
                    setIsSpeaking
                );
                setSpeechDuration(duration);

                // Track question narration end
                handleQuestionNarrationEnd(0);
            }

            setMicEnabled(true);
            setCurrentAnswer(""); // Reset current answer for new question
            setIsRetaking(false); // Reset retaking state
        } catch (err: any) {
            console.error("Error starting actual interview:", err);
            setError(err.message || "Failed to start interview");
            cleanupRecording();
            // Deactivate proctoring on error
            setProctoringActive(false);
        } finally {
            setLoading(false);
            setIsProcessingResponse(false);
        }
    };

    // Handle user's answer (STT)
    const handleMic = async () => {
        if (!SPEECH_KEY || !SPEECH_REGION) {
            setError("Azure Speech Services configuration is missing");
            return;
        }

        if (isListening) {
            // Stop listening
            if (recognizerRef.current) {
                try {
                    await recognizerRef.current.stopContinuousRecognitionAsync();
                    setIsListening(false);
                    setLoading(false);

                    // If we have recognized text, allow retake (only once)
                    if (recognizedText.trim()) {
                        // Retake logic is now handled by retakeCount state
                    }

                    // Track retake recording end if user was retaking
                    if (isRetaking) {
                        addInterviewEvent('answer_retake_recording_ended', {
                            questionIndex: currentQuestionIndex,
                            timestamp: new Date(),
                            recognizedText: recognizedText
                        });
                    }
                } catch (error) {
                    console.error("Error stopping recognition:", error);
                    setError("Failed to stop recording");
                    setIsListening(false);
                }
            }
            return;
        }

        // Start listening
        setIsListening(true);
        setRecognizedText("");
        setLoading(false);

        // Track user response start
        handleUserResponseStart();

        // Track retake recording start if user is retaking
        if (isRetaking) {
            addInterviewEvent('answer_retake_recording_started', {
                questionIndex: currentQuestionIndex,
                timestamp: new Date()
            });
        }

        try {
            const speechConfig = speechsdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
            speechConfig.speechRecognitionLanguage = "en-US";
            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
            recognizerRef.current = recognizer;

            recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    const answer = e.result.text;
                    setRecognizedText(prev => prev ? `${prev} ${answer}` : answer);
                }
            };

            recognizer.canceled = (s, e) => {
                setIsListening(false);
                setLoading(false);
                if (e.reason === speechsdk.CancellationReason.Error) {
                    setError(`Speech recognition error: ${e.errorDetails}`);
                }
            };

            recognizer.sessionStopped = (s, e) => {
                setIsListening(false);
            };

            await recognizer.startContinuousRecognitionAsync();
        } catch (err: any) {
            console.error("Speech recognition error:", err);
            setError(err.message || "Speech recognition failed");
            setIsListening(false);
            setLoading(false);
        }
    };

    // Submit answer and get next question
    const submitAnswer = async () => {
        if (!recognizedText.trim() || !sessionId) return;

        const textToSend = recognizedText;
        setLoading(true);
        setIsProcessingResponse(true);

        // Track retake end event if user was retaking
        if (isRetaking) {
            addInterviewEvent('answer_retake_ended', {
                questionIndex: currentQuestionIndex,
                timestamp: new Date(),
                retakenAnswer: textToSend
            });
            setIsRetaking(false);
        }

        // Track user response end
        handleUserResponseEnd(textToSend);

        // Update the status of the last AI question to 'completed'
        setMessages((prev) => {
            const newMessages = [...prev];
            // Find the last AI question (non-own message) and mark it as completed
            for (let i = newMessages.length - 1; i >= 0; i--) {
                if (!newMessages[i].own) {
                    newMessages[i].status = 'completed';
                    break;
                }
            }
            // Add the user's answer
            newMessages.push({
                own: true,
                text: textToSend,
                icon: <FaUser className="text-secondary w-6 h-6" />,
                status: 'completed'
            });
            return newMessages;
        });

        // Don't clear recognizedText yet - keep it for retake functionality
        setCurrentAnswer(recognizedText); // Store current answer for retake
        // Retake not available until user answers the new question
        // console.log("messages", messages);
        try {
            // If the server marked the currently shown question as final (step "done"),
            // show the submitting modal immediately after sending the answer to reflect backend processing.
            const answeringFinalQuestion = isFinalQuestion;
            if (answeringFinalQuestion) {
                setIsSubmittingFinal(true);
                setShowSubmissionModal(true);
                setSubmissionStep('submitting');
                setUploadProgress(0);
            }

            const res = await continueConversationalInterview({
                session_id: sessionId,
                user_answer: textToSend
            });

            // If server signals overall completion now, proceed to processing and upload flow
            if (res.step === "completed") {
                // Immediately show processing indicator
                setIsProcessingFinalResponse(true);

                // Add processing message to chat
                setMessages((prev) => [...prev, {
                    own: false,
                    text: "Processing your final response...",
                    icon: <FaUserTie className="text-primary w-6 h-6" />,
                    loading: false
                }]);

                // Small delay to show the processing message
                await new Promise(resolve => setTimeout(resolve, 1000));

                setIsSubmittingFinal(true);
                setShowSubmissionModal(true);
                setSubmissionStep('processing');
                setUploadProgress(0);

                // Add timeout to prevent modal from getting stuck indefinitely
                const submissionTimeout = setTimeout(() => {
                    console.warn("Submission process taking too long, closing modal");
                    setShowSubmissionModal(false);
                    setIsSubmittingFinal(false);
                    setIsUploadingVideo(false);
                    setError("Submission process is taking longer than expected. Please try again or contact support.");
                    cleanupRecording();
                    setProctoringActive(false);
                }, 900000); // 15 minutes timeout

                // Stop recording and finalize chunked upload
                try {
                    const { blobUrl, fileExtension, mimeType } = await stopRecording();
                    const userId = verifiedUser?.user_id || localStorage.getItem('scooterUserId');

                    if (userId) {
                        // Video is already uploaded via chunked uploader
                        setIsUploadingVideo(true);
                        setSubmissionStep('uploading');
                        addInterviewEvent('video_upload_started', { timestamp: new Date() });
                        setUploadProgress(1); // Set to 100% since upload is complete

                        addInterviewEvent('video_upload_completed', {
                            timestamp: new Date(),
                            blobUrl: blobUrl,
                            fileExtension: fileExtension,
                            mimeType: mimeType
                        });

                        // Upload video proctoring logs AFTER video is finalized; include video_url
                        await uploadVideoProctoringLogs(userId, blobUrl);

                        // Clear timeout since submission completed successfully
                        clearTimeout(submissionTimeout);
                    }
                } catch (err: any) {
                    console.error("Error in final submission process:", err);
                    setError(err.message || "Failed to complete interview submission");
                    setShowSubmissionModal(false);
                    setIsSubmittingFinal(false);
                    setIsUploadingVideo(false);
                    cleanupRecording();
                    setProctoringActive(false);
                    clearTimeout(submissionTimeout);
                    return;
                }

                // Add completion message to chat
                setMessages((prev) => [...prev, {
                    own: false,
                    text: res.message || "Thank you for completing the interview. Your responses have been recorded.",
                    icon: <FaUserTie className="text-primary w-6 h-6" />
                }]);

                cleanupRecording();
                setShowCompletionScreen(true);

                // Deactivate proctoring when interview completes normally
                setProctoringActive(false);
                return;
            }

            // If interview is not completed, continue with next question
            if (res.question) {
                setCurrentQuestion(res.question);
                setCurrentQuestionIndex(prev => prev + 1); // Increment question index for retake tracking
                // Update final question indicator for the new shown question
                setIsFinalQuestion(res.step === 'done');
            }
            setRecognizedText("");
            setCurrentAnswer(""); // Reset current answer for new question
            setIsListening(false);
            setIsRetaking(false); // Reset retaking state for new question
            if (recognizerRef.current) {
                recognizerRef.current.stopContinuousRecognitionAsync();
            }

            // Add loading message
            setMessages((prev) => [...prev, {
                own: false,
                text: "",
                icon: <FaUserTie className="text-primary w-6 h-6" />,
                loading: true
            }]);

            // Speak the next question
            if (res.question) {
                // Track question narration start for subsequent questions
                handleQuestionNarrationStart(currentQuestionIndex, res.question);

                const duration = await textInAudioOut(
                    res.question,
                    (spokenText) => {
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && !lastMessage.own) {
                                lastMessage.text = spokenText;
                                lastMessage.loading = false;
                            }
                            return newMessages;
                        });
                    },
                    setLoading,
                    setIsSpeaking
                );
                setSpeechDuration(duration);

                // Track question narration end for subsequent questions
                handleQuestionNarrationEnd(currentQuestionIndex);
            }

            setMicEnabled(true);
            // Retake not available until user answers the new question
        } catch (err: any) {
            console.error("Error submitting answer:", err);
            setError(err.message || "Failed to submit answer");
            cleanupRecording();
            // Deactivate proctoring on error
            setProctoringActive(false);
        } finally {
            setLoading(false);
            setIsProcessingResponse(false);
            setIsUploadingVideo(false);
            setIsSubmittingFinal(false);
            setShowSubmissionModal(false);
            setUploadProgress(0);
            setIsProcessingFinalResponse(false);
        }
    };

    // Handle leave confirmation
    const handleLeaveConfirmation = () => {
        setShowLeaveConfirmation(true);
    };

    // Handle leave interview with submission
    const handleLeaveInterview = async () => {
        setIsLeaving(true);
        setShowLeaveConfirmation(false);
        await endInterviewEarly();
    };

    // End interview early
    const endInterviewEarly = async () => {
        if (!sessionId) return;

        setIsEndingInterview(true);
        setLoading(true);
        setIsSubmittingFinal(true);
        setShowSubmissionModal(true);
        setSubmissionStep('submitting');

        // Small delay to show the submitting message
        await new Promise(resolve => setTimeout(resolve, 500));

        // Move to processing step
        setSubmissionStep('processing');

        // Add timeout to prevent modal from getting stuck indefinitely
        const earlyEndingTimeout = setTimeout(() => {
            console.warn("Early ending process taking too long, closing modal");
            setShowSubmissionModal(false);
            setIsSubmittingFinal(false);
            setIsUploadingVideo(false);
            setError("Interview ending process is taking longer than expected. Please try again or contact support.");
            cleanupRecording();
            setProctoringActive(false);
        }, 900000); // 15 minutes timeout

        try {
            // Check if we still have camera access for recording
            if (!videoStreamRef.current) {
                const hasAccess = await checkCameraAccess();
                if (!hasAccess) {
                    setError("Camera access required to end interview. Please allow camera access and try again.");
                    return;
                }
            }

            // Stop recording and finalize chunked upload
            try {
                const { blobUrl, fileExtension, mimeType } = await stopRecording();
                const userId = verifiedUser?.user_id || localStorage.getItem('scooterUserId');

                if (userId) {
                    // Video is already uploaded via chunked uploader
                    setIsUploadingVideo(true);
                    setSubmissionStep('uploading');
                    setUploadProgress(1); // Set to 100% since upload is complete

                    addInterviewEvent('early_video_upload_completed', {
                        timestamp: new Date(),
                        blobUrl: blobUrl,
                        fileExtension: fileExtension,
                        mimeType: mimeType
                    });

                    // Upload video proctoring logs AFTER video is finalized; include video_url
                    await uploadVideoProctoringLogs(userId, blobUrl);

                    // Clear timeout since process completed successfully
                    clearTimeout(earlyEndingTimeout);
                }
            } catch (err: any) {
                console.error("Error in early interview ending process:", err);
                setError(err.message || "Failed to complete early interview ending");
                setShowSubmissionModal(false);
                setIsSubmittingFinal(false);
                setIsUploadingVideo(false);
                cleanupRecording();
                setProctoringActive(false);
                clearTimeout(earlyEndingTimeout);
                return;
            }

            setShowCompletionScreen(true);

            // Deactivate proctoring when interview ends
            setProctoringActive(false);
        } catch (err: any) {
            console.error("Error ending interview:", err);
            setError(err.message || "Failed to end interview");
            // Deactivate proctoring on error
            setProctoringActive(false);
        } finally {
            setIsEndingInterview(false);
            setLoading(false);
            setIsUploadingVideo(false);
            setIsSubmittingFinal(false);
            setShowSubmissionModal(false);
            setIsLeaving(false);
            cleanupRecording();
        }
    };

    // Retry camera access
    const retryCameraAccess = async () => {
        resetCameraStates();

        const hasAccess = await checkCameraAccess();
        if (hasAccess) {
            // If access is now granted, we can proceed
            setError(null);
        }
    };

    // Handle resume upload success
    const handleResumeUploaded = () => {
        if (verifiedUser) {
            setVerifiedUser({
                ...verifiedUser,
                resume_status: true
            });
        }
    };

    // Upload video proctoring logs
    const uploadVideoProctoringLogs = async (userId: string, videoUrl: string) => {
        try {
            const endTime = new Date();
            const proctoringData = proctoringRef.current?.getProctoringData();
            const duration = proctoringData?.startTime
                ? Math.round((endTime.getTime() - proctoringData.startTime.getTime()) / 1000)
                : 0;

            // Add final submission event
            addInterviewEvent('final_submission_started', { timestamp: new Date() });

            const proctoringLogs = {
                email: email || localStorage.getItem('userEmail') || "unknown@example.com",
                "screen time": duration.toString(),
                flags: proctoringData?.violations || [],
                tab_switches: proctoringData?.tabSwitchCount || 0,
                window_focus_loss: proctoringData?.windowFocusCount || 0,
                right_clicks: proctoringData?.rightClickCount || 0,
                dev_tools_attempts: proctoringData?.devToolsCount || 0,
                multi_touch_gestures: proctoringData?.multiTouchCount || 0,
                swipe_gestures: proctoringData?.swipeGestureCount || 0,
                orientation_changes: proctoringData?.orientationChangeCount || 0,
                interview_events: interviewEvents,
                interview_duration: duration,
                submission_timestamp: new Date().toISOString()
            };

            await updateVideoProctoringLogs({
                user_id: userId,
                video_url: videoUrl,
                video_proctoring_logs: proctoringLogs
            });

            addInterviewEvent('proctoring_logs_uploaded', { timestamp: new Date() });
            console.log("Video proctoring logs uploaded successfully");
        } catch (error) {
            console.error("Error uploading video proctoring logs:", error);
            addInterviewEvent('proctoring_logs_upload_failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
        }
    };

    // Control handlers
    const handleTakeNotes = () => {
        // Placeholder for take notes functionality
        console.log('Take notes clicked');
    };

    const handleChatToggle = () => {
        setShowChat(!showChat);
    };

    // Retake answer functionality
    const retakeAnswer = () => {
        // Allow only one retake per question
        if (retakeCount[currentQuestionIndex] >= 1) return;

        // Track retake start event
        addInterviewEvent('answer_retake_started', {
            questionIndex: currentQuestionIndex,
            timestamp: new Date()
        });

        setIsRetaking(true);
        setRetakeCount(prev => {
            const newCount = [...prev];
            newCount[currentQuestionIndex] = 1;
            return newCount;
        });
        setRecognizedText(currentAnswer); // Restore the stored answer
        // Retake not available until user answers the new question

        // Update the last message status to retaken
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.own) {
                lastMessage.status = 'retaken';
            }
            return newMessages;
        });
    };

    // Handle question narration events
    const handleQuestionNarrationStart = (questionIndex: number, question: string) => {
        addInterviewEvent('question_narration_started', {
            questionIndex,
            question,
            timestamp: new Date()
        });
    };

    const handleQuestionNarrationEnd = (questionIndex: number) => {
        addInterviewEvent('question_narration_ended', {
            questionIndex,
            timestamp: new Date()
        });
    };

    // Handle conversation events
    const handleConversationStart = (questionIndex: number) => {
        addInterviewEvent('conversation_started', {
            questionIndex,
            timestamp: new Date()
        });
    };

    const handleConversationEnd = (questionIndex: number, duration: number) => {
        addInterviewEvent('conversation_ended', {
            questionIndex,
            duration,
            timestamp: new Date()
        });
    };

    // Handle user response events
    const handleUserResponseStart = () => {
        addInterviewEvent('user_response_started', {
            questionIndex: currentQuestionIndex,
            timestamp: new Date()
        });
    };

    const handleUserResponseEnd = (response: string) => {
        addInterviewEvent('user_response_ended', {
            questionIndex: currentQuestionIndex,
            responseLength: response.length,
            timestamp: new Date()
        });
    };

    return (
        <div className={`h-screen flex flex-col transition-all duration-1000 ease-in-out ${isDarkTheme ? 'bg-gray-900' : 'bg-background'
            }`}>
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 sticky top-0 z-10">
                <div className="w-12 h-12">
                    <img
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter AI"
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex-1">
                    <div className={`font-bold text-lg tracking-tight transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'
                        }`}>
                        Sales Skills Assessment
                    </div>
                    <div className={`text-xs transition-colors duration-1000 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Video Assessment Simulation
                    </div>
                </div>
                {isProcessingFinalResponse && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-1000 ${isDarkTheme
                        ? 'bg-blue-900/50 border-blue-500/30'
                        : 'bg-blue-100 border-blue-200'
                        }`}>
                        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 transition-colors duration-1000 ${isDarkTheme ? 'border-blue-400' : 'border-blue-600'
                            }`}></div>
                        <span className={`text-sm font-medium transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'
                            }`}>
                            Processing...
                        </span>
                    </div>
                )}
            </div>

            {/* Unauthorized Screen */}
            {showUnauthorized && (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    <Card className="w-full max-w-md shadow-2xl bg-gray-800/95 backdrop-blur-sm border border-gray-700">
                        <CardHeader className="text-center pb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/50 rounded-full mb-6 border border-red-500/30">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Access Denied
                            </CardTitle>
                            <p className="text-gray-300">
                                You are not authorized to access this interview
                            </p>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">
                                    This interview requires a valid verification code. Please check your email for the correct interview link or contact support if you believe this is an error.
                                </p>
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Verification Screen */}
            {showVerification && !verifiedUser && (
                <div className="flex-1 flex flex-col lg:flex-row bg-gradient-to-br from-white via-slate-50 to-white">
                    {/* Instructions Section */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="max-w-lg mx-auto lg:mx-0">
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                    <FaShieldAlt className="w-8 h-8 text-blue-600" />
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                    Verify Your Interview Access
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Please verify your identity to access your scheduled communication skills interview.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex-shrink-0 mt-1">
                                        <FaEnvelope className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">Email Verification</h3>
                                        <p className="text-sm text-blue-700">
                                            Enter the email address you used when scheduling this interview.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex-shrink-0 mt-1">
                                        <FaKey className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 mb-1">Verification Code</h3>
                                        <p className="text-sm text-green-700">
                                            Your 5-digit verification code has been pre-filled. This ensures secure access to your interview.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <h3 className="font-semibold text-amber-900 mb-2">What to Expect</h3>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                        <li>• 2-3 short communication questions</li>
                                        <li>• Video recording for evaluation</li>
                                        <li>• Takes approximately 5-10 minutes</li>
                                        {/* <li>• You can re-record if needed</li> */}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Form */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
                        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader className="text-center pb-6">
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Enter Your Details
                                </CardTitle>
                                <p className="text-gray-600">
                                    Verify your identity to proceed with the interview
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleVerification} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.email@example.com"
                                            className="h-12 text-base"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                                            Verification Code
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="XXXXX"
                                            className="h-12 text-base font-mono text-center tracking-widest"
                                            maxLength={5}
                                            required
                                        />
                                    </div>

                                    {verificationError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">{verificationError}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isVerifying}
                                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                                    >
                                        {isVerifying ? (
                                            <div className="flex items-center gap-2">
                                                <LoadingDots bg="white" />
                                                <span>Verifying...</span>
                                            </div>
                                        ) : (
                                            "Verify & Continue"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Main Interview Content - Only show if verified and resume is up to date */}
            {verifiedUser && verifiedUser.resume_status && !showCompletionScreen && (
                <>
                    {/* Welcome Screen */}
                    {showWelcomeScreen ? (
                        <WelcomeScreen
                            onStart={() => handleStart()}
                            loading={loading}
                            jobTitle={jobTitle}
                            jobDescription={jobDescription}
                            isDarkTheme={isDarkTheme}
                        />
                    ) : showPermissionChecker ? (
                        /* Permission Checker Screen */
                        <div className={`flex-1 flex items-center justify-center transition-all duration-1000 ease-in-out ${isDarkTheme
                            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                            : 'bg-gradient-to-br from-white via-slate-50 to-white'
                            }`}>
                            <div className="max-w-2xl mx-auto p-8 text-center">
                                <div className="mb-8">
                                    <h1 className={`text-3xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                        Permission Check Required
                                    </h1>
                                    <p className={`text-lg ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                        We need to verify all required permissions before starting the interview.
                                    </p>
                                </div>

                                {/* Permission Status Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {/* Camera Permission */}
                                    <div className={`p-4 rounded-lg border-2 ${permissionStatus.camera === 'granted'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : permissionStatus.camera === 'denied'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        <div className="flex items-center justify-center mb-2">
                                            {permissionStatus.camera === 'granted' ? (
                                                <FaCheck className="text-green-500 text-xl" />
                                            ) : permissionStatus.camera === 'denied' ? (
                                                <FaUser className="text-red-500 text-xl" />
                                            ) : (
                                                <LoadingDots bg="gray-400" />
                                            )}
                                        </div>
                                        <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                            Camera Access
                                        </h3>
                                        <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {permissionStatus.camera === 'granted' ? 'Granted' :
                                                permissionStatus.camera === 'denied' ? 'Denied' : 'Checking...'}
                                        </p>
                                        {permissionStatus.camera === 'denied' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => retryPermission('camera')}
                                                className="mt-2 text-xs"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>

                                    {/* Microphone Permission */}
                                    <div className={`p-4 rounded-lg border-2 ${permissionStatus.microphone === 'granted'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : permissionStatus.microphone === 'denied'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        <div className="flex items-center justify-center mb-2">
                                            {permissionStatus.microphone === 'granted' ? (
                                                <FaCheck className="text-green-500 text-xl" />
                                            ) : permissionStatus.microphone === 'denied' ? (
                                                <FaMicrophone className="text-red-500 text-xl" />
                                            ) : (
                                                <LoadingDots bg="gray-400" />
                                            )}
                                        </div>
                                        <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                            Microphone Access
                                        </h3>
                                        <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {permissionStatus.microphone === 'granted' ? 'Granted' :
                                                permissionStatus.microphone === 'denied' ? 'Denied' : 'Checking...'}
                                        </p>
                                        {permissionStatus.microphone === 'denied' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => retryPermission('microphone')}
                                                className="mt-2 text-xs"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>

                                    {/* Screen Share Permission */}
                                    <div className={`p-4 rounded-lg border-2 ${permissionStatus.screenShare === 'granted'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : permissionStatus.screenShare === 'denied'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        <div className="flex items-center justify-center mb-2">
                                            {permissionStatus.screenShare === 'granted' ? (
                                                <FaCheck className="text-green-500 text-xl" />
                                            ) : permissionStatus.screenShare === 'denied' ? (
                                                <FaUser className="text-red-500 text-xl" />
                                            ) : (
                                                <LoadingDots bg="gray-400" />
                                            )}
                                        </div>
                                        <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                            Screen Sharing
                                        </h3>
                                        <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {permissionStatus.screenShare === 'granted' ? 'Granted' :
                                                permissionStatus.screenShare === 'denied' ? 'Denied' : 'Checking...'}
                                        </p>
                                        {permissionStatus.screenShare === 'denied' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => retryPermission('screenShare')}
                                                className="mt-2 text-xs"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>

                                    {/* System Audio Permission */}
                                    <div className={`p-4 rounded-lg border-2 ${permissionStatus.screenAudio === 'granted'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : permissionStatus.screenAudio === 'denied'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        <div className="flex items-center justify-center mb-2">
                                            {permissionStatus.screenAudio === 'granted' ? (
                                                <FaCheck className="text-green-500 text-xl" />
                                            ) : permissionStatus.screenAudio === 'denied' ? (
                                                <FaMicrophone className="text-red-500 text-xl" />
                                            ) : (
                                                <LoadingDots bg="gray-400" />
                                            )}
                                        </div>
                                        <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                            System Audio
                                        </h3>
                                        <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {permissionStatus.screenAudio === 'granted' ? 'Granted' :
                                                permissionStatus.screenAudio === 'denied' ? 'Denied' : 'Checking...'}
                                        </p>
                                        {permissionStatus.screenAudio === 'denied' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => retryPermission('screenAudio')}
                                                className="mt-2 text-xs"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Success Message */}
                                {permissionStatus.camera === 'granted' &&
                                    permissionStatus.microphone === 'granted' &&
                                    permissionStatus.screenShare === 'granted' &&
                                    permissionStatus.screenAudio === 'granted' && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FaCheck className="text-green-600 dark:text-green-400" />
                                                <p className="text-green-600 dark:text-green-400 font-semibold">
                                                    All permissions granted! You can now proceed to the interview.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {/* Error Message */}
                                {permissionError && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400">{permissionError}</p>
                                    </div>
                                )}

                                {/* Guidance: Show how to enable system audio */}
                                {permissionStatus.screenShare === 'granted' && permissionStatus.screenAudio === 'denied' && (
                                    <div className={`mb-8 p-4 rounded-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <p className={`${isDarkTheme ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                                            System audio was not shared. When selecting the screen/window, make sure to check "Share system audio".
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src="/assets/images/macShareSystemAudio.png"
                                                alt="Enable Share System Audio"
                                                className="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className={`mb-8 p-6 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    <h3 className={`font-semibold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                        Important Instructions:
                                    </h3>
                                    <ul className={`text-left space-y-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <li>• <strong>Camera:</strong> Allow access to your camera for video recording</li>
                                        <li>• <strong>Microphone:</strong> Allow access to your microphone for audio recording</li>
                                        <li>• <strong>Screen Sharing:</strong> Select "Entire Screen" or "Application Window"</li>
                                        <li>• <strong>System Audio:</strong> Make sure to check "Share system audio" when sharing your screen</li>
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {/* Show Continue button when all permissions are granted */}
                                    {permissionStatus.camera === 'granted' &&
                                        permissionStatus.microphone === 'granted' &&
                                        permissionStatus.screenShare === 'granted' &&
                                        permissionStatus.screenAudio === 'granted' ? (
                                        <Button
                                            onClick={() => {
                                                setShowPermissionChecker(false);
                                                // Proceed with the interview (skip permission check since already granted)
                                                handleStart(true);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            Continue to Interview
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={checkAllPermissions}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {loading ? <LoadingDots bg="white" /> : 'Retry Permission Check'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowPermissionChecker(false);
                                            setShowWelcomeScreen(true);
                                        }}
                                        className="border-gray-300 dark:border-gray-600"
                                    >
                                        Back to Welcome
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Main Content - AI Speaking Animation and User Video */}
                            <div className={`flex-1 overflow-hidden transition-all duration-1000 ease-in-out pb-24 ${isDarkTheme
                                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                                : 'bg-gradient-to-br from-white via-slate-50 to-white'
                                }`}>
                                {/* AI Speaking Animation */}
                                <div className="flex-1">
                                    <AISpeakingAnimation
                                        isSpeaking={isSpeaking}
                                        isProcessing={isProcessingResponse || isProcessingFinalResponse}
                                        currentQuestion={currentQuestion}
                                        isDarkTheme={isDarkTheme}
                                        speechDuration={speechDuration}
                                        interviewType='video'
                                    />
                                </div>

                                {/* User Video - Positioned below AI animation on smaller screens */}
                                {started && (
                                    <div className="md:hidden flex justify-center pb-4">
                                        <UserVideo showVideo={showVideo} />
                                    </div>
                                )}
                            </div>

                            {/* Floating Video Component - Only show on larger screens */}
                            {started && (
                                <div className="hidden md:block">
                                    <UserVideo showVideo={showVideo} />
                                </div>
                            )}

                            {/* Interview Controls - Only show when interview is active */}
                            {started && sessionId && !showCompletionScreen && (
                                <InterviewControls
                                    isListening={isListening}
                                    isCameraOn={showVideo}
                                    recognizedText={currentAnswer || recognizedText} // Use currentAnswer for retake logic
                                    retakeCount={retakeCount[currentQuestionIndex] || 0}
                                    onMicToggle={handleMic}
                                    onCameraToggle={() => setShowVideo(!showVideo)}
                                    onLeave={handleLeaveConfirmation}
                                    onTakeNotes={handleTakeNotes}
                                    onChatToggle={handleChatToggle}
                                    onSubmitAnswer={submitAnswer}
                                    onRetakeAnswer={retakeAnswer}
                                    disabled={loading || isSpeaking || isProcessingResponse || isProcessingFinalResponse || isLeaving}
                                    isLeaving={isLeaving}
                                    micEnabled={micEnabled}
                                />
                            )}

                            {/* Question Palette - Only show when interview is active */}
                            {started && sessionId && !showCompletionScreen && (
                                <QuestionPalette messages={messages} />
                            )}

                            {/* Chat Panel - Only show when interview is active */}
                            {started && sessionId && !showCompletionScreen && (
                                <ChatPanel
                                    isOpen={showChat}
                                    onToggle={handleChatToggle}
                                    messages={messages}
                                />
                            )}

                            {/* Legacy Controls - Only show for pre-interview stages */}
                            {(!started || !sessionId) && (
                                <div className={`border-t p-6 shadow-inner rounded-t-2xl transition-all duration-1000 ease-in-out ${isDarkTheme
                                    ? 'border-gray-700 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800/90'
                                    : 'border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white/90'
                                    }`}>
                                    {systemAudioHint && (
                                        <div className={`mb-4 p-4 rounded-lg border ${isDarkTheme
                                            ? 'bg-blue-900/20 border-blue-500/30 text-blue-200'
                                            : 'bg-blue-50 border-blue-200 text-blue-800'
                                            }`}>
                                            <div className="mb-2">{systemAudioHint}</div>
                                            <div className="flex justify-center">
                                                <img
                                                    src="/assets/images/macShareSystemAudio.png"
                                                    alt="Enable Share System Audio"
                                                    className="max-w-full h-auto rounded-md border border-blue-200 dark:border-blue-700"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {!started ? (
                                        <div className="flex justify-center">
                                            <Button onClick={() => handleStart()} className="w-full max-w-xs text-lg py-6 rounded-xl shadow-md">
                                                Start Camera Check
                                            </Button>
                                        </div>
                                    ) : !sessionId && (
                                        <div className="flex flex-col items-center gap-6 w-full">
                                            <Button
                                                onClick={startActualInterview}
                                                className="w-full max-w-xs text-lg py-6 rounded-xl shadow-md"
                                                disabled={loading || isProcessingResponse}
                                            >
                                                {isProcessingResponse ? (
                                                    <div className="flex items-center gap-2">
                                                        <LoadingDots bg="slate-300" />
                                                        <span>Starting Interview...</span>
                                                    </div>
                                                ) : (
                                                    "Start Interview"
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowWelcomeScreen(true);
                                                    setStarted(false);
                                                    setProctoringActive(false); // Deactivate proctoring when going back
                                                }}
                                                className="w-full max-w-xs text-base py-3 rounded-xl"
                                            >
                                                Back to Welcome
                                            </Button>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="text-center mt-4">
                                            <div className={`font-medium mb-3 transition-colors duration-1000 ${isDarkTheme ? 'text-red-400' : 'text-red-600'
                                                }`}>
                                                {error}
                                            </div>
                                            {showCameraRetry && (
                                                <div className="space-y-3">
                                                    <div className={`border rounded-lg p-4 transition-all duration-1000 ${isDarkTheme
                                                        ? 'bg-amber-900/20 border-amber-500/30'
                                                        : 'bg-amber-50 border-amber-200'
                                                        }`}>
                                                        <h4 className={`font-semibold mb-2 transition-colors duration-1000 ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'
                                                            }`}>
                                                            How to enable camera access:
                                                        </h4>
                                                        <ul className={`text-sm space-y-1 transition-colors duration-1000 ${isDarkTheme ? 'text-amber-200' : 'text-amber-800'
                                                            }`}>
                                                            <li>• Click the camera icon in your browser's address bar</li>
                                                            <li>• Select "Allow" for camera and microphone access</li>
                                                            <li>• Refresh the page or click "Retry Camera Access" below</li>
                                                        </ul>
                                                    </div>
                                                    <Button
                                                        onClick={retryCameraAccess}
                                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        Retry Camera Access
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submission Modal */}
                            <SubmissionModal
                                open={showSubmissionModal}
                                onOpenChange={setShowSubmissionModal}
                                submissionStep={submissionStep}
                                uploadProgress={uploadProgress}
                            />
                        </>
                    )}
                </>
            )}

            {/* Completion Screen */}
            {showCompletionScreen && (
                <div className={`flex-1 flex items-center justify-center transition-all duration-1000 ease-in-out ${isDarkTheme
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-white via-slate-50 to-white'
                    }`}>
                    <Card className={`w-full max-w-2xl shadow-2xl border-0 backdrop-blur-sm transition-all duration-1000 ${isDarkTheme
                        ? 'bg-gray-800/95 border-gray-700'
                        : 'bg-white/95 border-gray-200'
                        }`}>
                        <CardHeader className="text-center pb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 border transition-all duration-1000 ${isDarkTheme
                                    ? 'bg-green-900/50 border-green-500/30'
                                    : 'bg-green-100 border-green-200'
                                    }`}
                            >
                                <svg className={`w-10 h-10 transition-colors duration-1000 ${isDarkTheme ? 'text-green-400' : 'text-green-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <CardTitle className={`text-3xl font-bold mb-4 transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    Interview Completed Successfully!
                                </CardTitle>
                                <p className={`text-lg leading-relaxed transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    Thank you for completing your communication skills assessment. Your responses have been recorded and are being evaluated.
                                </p>
                            </motion.div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-6"
                            >
                                <div className={`p-6 rounded-xl border transition-all duration-1000 ${isDarkTheme
                                    ? 'bg-blue-900/20 border-blue-500/30'
                                    : 'bg-blue-50 border-blue-200'
                                    }`}>
                                    <h3 className={`font-semibold mb-3 text-lg transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-900'
                                        }`}>
                                        What happens next?
                                    </h3>
                                    <div className="space-y-3 text-left">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">1</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`font-medium transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'
                                                    }`}>
                                                    Processing Complete
                                                </p>
                                                <p className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-blue-200' : 'text-blue-700'
                                                    }`}>
                                                    Your interview responses have been processed and recorded.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">2</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`font-medium transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'
                                                    }`}>
                                                    Results Notification
                                                </p>
                                                <p className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-blue-200' : 'text-blue-700'
                                                    }`}>
                                                    You'll receive a confirmation email shortly.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">3</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`font-medium transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'
                                                    }`}>
                                                    Next Steps
                                                </p>
                                                <p className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-blue-200' : 'text-blue-700'
                                                    }`}>
                                                    If selected, you'll be contacted for the next stage of the hiring process.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border transition-all duration-1000 ${isDarkTheme
                                    ? 'bg-green-900/20 border-green-500/30'
                                    : 'bg-green-50 border-green-200'
                                    }`}>
                                    <p className={`font-medium transition-colors duration-1000 ${isDarkTheme ? 'text-green-300' : 'text-green-800'
                                        }`}>
                                        💡 While you wait, feel free to explore other job opportunities or update your profile!
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => router.push('/')}
                                        className="w-full sm:w-auto h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Go to Home
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/home/careers')}
                                        variant="outline"
                                        className={`w-full sm:w-auto h-12 text-base font-semibold transition-all duration-1000 ${isDarkTheme
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Explore Jobs
                                    </Button>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Resume Upload Required Screen */}
            {verifiedUser && !verifiedUser.resume_status && (
                <div className={`flex-1 flex items-center justify-center transition-all duration-1000 ease-in-out ${isDarkTheme
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-white via-slate-50 to-white'
                    }`}>
                    <Card className={`w-full max-w-md shadow-2xl border-0 backdrop-blur-sm transition-all duration-1000 ${isDarkTheme
                        ? 'bg-gray-800/95 border-gray-700'
                        : 'bg-white/95 border-gray-200'
                        }`}>
                        <CardHeader className="text-center pb-6">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 border transition-all duration-1000 ${isDarkTheme
                                ? 'bg-amber-900/50 border-amber-500/30'
                                : 'bg-amber-100 border-amber-200'
                                }`}>
                                <FaFileAlt className={`w-8 h-8 transition-colors duration-1000 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'
                                    }`} />
                            </div>
                            <CardTitle className={`text-2xl font-bold transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'
                                }`}>
                                Resume Update Required
                            </CardTitle>
                            <p className={`transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                Please upload your latest resume to continue with the interview
                            </p>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-4">
                                <p className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    Your resume information needs to be updated to ensure we have the most current details for your interview.
                                </p>
                                <Button
                                    onClick={() => setShowResumeUploadModal(true)}
                                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Upload Resume
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Resume Upload Modal */}
            <ResumeUploadModal
                open={showResumeUploadModal}
                onOpenChange={setShowResumeUploadModal}
                userId={verifiedUser?.user_id || ""}
                onResumeUploaded={handleResumeUploaded}
            />

            {/* Browser Warning Modal for non-Chrome */}
            <BrowserWarningModal open={showBrowserWarning} onOpenChange={setShowBrowserWarning} />

            {proctoringActive && !showCompletionScreen && (
                // Proctoring System
                <ProctoringSystem
                    isActive={proctoringActive}
                    onViolation={handleProctoringViolation}
                    ref={proctoringRef}
                />

            )}

            {/* Leave Confirmation Dialog */}
            <AlertDialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <FaSignOutAlt className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-xl font-semibold text-center">
                            Leave Interview?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Are you sure you want to leave? Your interview responses will be submitted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-3 justify-center">
                        <AlertDialogCancel
                            onClick={() => setShowLeaveConfirmation(false)}
                            className="px-6 py-2"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveInterview}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Leave Interview
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default CommunicationInterview;