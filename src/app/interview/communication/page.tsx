"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { UserVideo } from './components/UserVideo';
import { startConversationalInterview, continueConversationalInterview, uploadInterviewVideo, evaluateCommunication, videoInterviewLogin } from '@/lib/interviewService';
import { textInAudioOut } from '@/lib/voiceBot';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaShieldAlt, FaEnvelope, FaKey, FaFileAlt } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingDots } from "@/components/ui/loadingDots";
import { SubmissionModal } from "./components/SubmissionModal";
import { ResumeUploadModal } from "./components/ResumeUploadModal";
import { toast } from "@/hooks/use-toast";

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

// Update the interface to match the API response
interface ConversationalInterviewResponse {
    session_id: string;
    question?: string;
    step: string;
    message?: string;
}

function CommunicationInterview() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode; status?: 'completed'; loading?: boolean }[]>([]);
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
    const [submissionStep, setSubmissionStep] = useState<'processing' | 'uploading' | 'evaluating'>('processing');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [evaluationStatus, setEvaluationStatus] = useState<string>('');
    const [cameraAccessDenied, setCameraAccessDenied] = useState(false);
    const [showCameraRetry, setShowCameraRetry] = useState(false);
    const [isProcessingFinalResponse, setIsProcessingFinalResponse] = useState(false);
    const recognizerRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const videoStreamRef = useRef<MediaStream | null>(null);

    // Verification states
    const [showVerification, setShowVerification] = useState(false);
    const [showUnauthorized, setShowUnauthorized] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [email, setEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedUser, setVerifiedUser] = useState<{ user_id: string; full_name: string; resume_status: boolean } | null>(null);

    // Resume upload states
    const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);

    // Check for verification parameter on mount
    useEffect(() => {
        const verifyCode = searchParams.get('verify');

        if (!verifyCode) {
            setShowUnauthorized(true);
        } else if (!/^[A-Z0-9]{5}$/.test(verifyCode)) {
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
        };
    }, []);

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
                    resume_status: response.resume_status || false
                });
                setShowVerification(false);

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
    const handleStart = async () => {
        setLoading(true);
        setError(null);
        const userId = verifiedUser?.user_id || localStorage.getItem('profile_id');
        if (!userId) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }

        try {
            // Check camera access first
            const hasCameraAccess = await checkCameraAccess();
            if (!hasCameraAccess) {
                setLoading(false);
                return;
            }

            // Start with a test question for camera check
            const testQuestion = "Hi, how are you? Please click 'Start Interview' to begin.";
            setCurrentQuestion(testQuestion);
            setMessages([{
                own: false,
                text: testQuestion,
                icon: <FaUserTie className="text-primary w-6 h-6" />
            }]);

            // Speak the test question
            await textInAudioOut(
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
                setLoading
            );

            setStarted(true);
            setMicEnabled(true);
        } catch (err: any) {
            console.error("Error starting interview:", err);
            setError(err.message || "Failed to start interview");
        } finally {
            setLoading(false);
        }
    };

    // Check camera access
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

    // Start video recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];
            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Failed to start video recording");
        }
    };

    // Stop video recording
    const stopRecording = async (): Promise<Blob> => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, {
                        type: 'video/webm'
                    });
                    resolve(blob);
                };
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        });
    };

    // Cleanup recording
    const cleanupRecording = () => {
        if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
            videoStreamRef.current = null;
        }
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
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
        const userId = verifiedUser?.user_id || localStorage.getItem('profile_id');
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

            // Add loading message
            setMessages((prev) => [...prev, {
                own: false,
                text: "",
                icon: <FaUserTie className="text-primary w-6 h-6" />,
                loading: true
            }]);

            // Speak the question
            if (res.question) {
                await textInAudioOut(
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
                    setLoading
                );
            }

            setMicEnabled(true);
        } catch (err: any) {
            console.error("Error starting actual interview:", err);
            setError(err.message || "Failed to start interview");
            cleanupRecording();
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
                    // setIsListening(false);
                    setLoading(false);
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
        setMessages((prev) => [...prev, {
            own: true,
            text: textToSend,
            icon: <FaUser className="text-secondary w-6 h-6" />,
            status: 'completed'
        }]);

        setRecognizedText("");
        try {
            const res = await continueConversationalInterview({
                session_id: sessionId,
                user_answer: textToSend
            });


            // Check if interview is completed
            if (res.step === "completed") {
                // Immediately show processing indicator
                setIsProcessingFinalResponse(true);

                // Add processing message to chat
                setMessages((prev) => [...prev, {
                    own: false,
                    text: "Processing your final response and preparing for evaluation...",
                    icon: <FaUserTie className="text-primary w-6 h-6" />,
                    loading: false
                }]);

                // Small delay to show the processing message
                await new Promise(resolve => setTimeout(resolve, 1000));

                setIsSubmittingFinal(true);
                setShowSubmissionModal(true);
                setSubmissionStep('processing');
                setUploadProgress(0);
                setEvaluationStatus('Processing your final response...');

                // Stop recording and get final video
                const videoBlob = await stopRecording();
                const userId = verifiedUser?.user_id || localStorage.getItem('profile_id');

                if (userId) {
                    // Upload the complete video
                    setIsUploadingVideo(true);
                    setSubmissionStep('uploading');
                    setEvaluationStatus('Uploading your interview video...');

                    await uploadInterviewVideo({
                        file: new File([videoBlob], `interview_${Date.now()}.webm`, {
                            type: 'video/webm;codecs=vp9,opus'
                        }),
                        user_id: userId,
                        onProgress: (progress) => {
                            setUploadProgress(Math.round(progress * 100));
                        }
                    });

                    // Evaluate communication
                    setSubmissionStep('evaluating');
                    setEvaluationStatus('Evaluating your communication skills...');

                    await evaluateCommunication(sessionId);
                }

                // Add completion message to chat
                setMessages((prev) => [...prev, {
                    own: false,
                    text: res.message || "Thank you for completing the interview. Your responses have been recorded.",
                    icon: <FaUserTie className="text-primary w-6 h-6" />
                }]);

                cleanupRecording();
                setShowCompletionScreen(true);
                return;
            }

            // If interview is not completed, continue with next question
            if (res.question) {
                setCurrentQuestion(res.question);
            }
            setRecognizedText("");
            setIsListening(false);
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
                await textInAudioOut(
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
                    setLoading
                );
            }

            setMicEnabled(true);
        } catch (err: any) {
            console.error("Error submitting answer:", err);
            setError(err.message || "Failed to submit answer");
            cleanupRecording();
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

    // End interview early
    const endInterviewEarly = async () => {
        if (!sessionId) return;

        setIsEndingInterview(true);
        setLoading(true);
        setIsSubmittingFinal(true);
        setShowSubmissionModal(true);
        setSubmissionStep('processing');
        setEvaluationStatus('Processing your interview...');

        try {
            // Check if we still have camera access for recording
            if (!videoStreamRef.current) {
                const hasAccess = await checkCameraAccess();
                if (!hasAccess) {
                    setError("Camera access required to end interview. Please allow camera access and try again.");
                    return;
                }
            }

            // Stop recording
            const videoBlob = await stopRecording();
            const userId = verifiedUser?.user_id || localStorage.getItem('profile_id');

            if (userId) {
                // Upload the complete video
                setIsUploadingVideo(true);
                setSubmissionStep('uploading');
                setEvaluationStatus('Uploading your interview video...');

                await uploadInterviewVideo({
                    file: new File([videoBlob], `interview_${Date.now()}.webm`, {
                        type: 'video/webm;codecs=vp9,opus'
                    }),
                    user_id: userId
                });

                // Evaluate communication
                setSubmissionStep('evaluating');
                setEvaluationStatus('Evaluating your communication skills...');

                await evaluateCommunication(sessionId);
            }

            setShowCompletionScreen(true);
        } catch (err: any) {
            console.error("Error ending interview:", err);
            setError(err.message || "Failed to end interview");
        } finally {
            setIsEndingInterview(false);
            setLoading(false);
            setIsUploadingVideo(false);
            setIsSubmittingFinal(false);
            setShowSubmissionModal(false);
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

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="text-primary w-12 h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="font-bold text-lg text-indigo-600 tracking-tight">Communication Skills Assessment</div>
                    <div className="text-xs text-muted-foreground">Video Assessment Simulation</div>
                </div>
                {isProcessingFinalResponse && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800 text-sm font-medium">Processing...</span>
                    </div>
                )}
            </div>

            {/* Unauthorized Screen */}
            {showUnauthorized && (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-white">
                    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Access Denied
                            </CardTitle>
                            <p className="text-gray-600">
                                You are not authorized to access this interview
                            </p>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    This interview requires a valid verification code. Please check your email for the correct interview link or contact support if you believe this is an error.
                                </p>
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
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
                                            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
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
                    {/* Main Content */}
                    <div className="flex-1 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
                        <div className="h-full flex flex-col sm:flex-row ">
                            {/* Video Area */}
                            <div className="w-full h-full sm:w-1/3 p-2 rounded-lg">
                                <UserVideo />
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 h-full overflow-y-auto p-6 space-y-2">
                                <AnimatePresence>
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className={`flex items-start gap-3 mb-3 justify-start`}
                                        >
                                            {!msg.own && <div className="flex-shrink-0">{msg.icon}</div>}
                                            <div
                                                className={`rounded-2xl flex flex-row max-w-[80%] relative shadow-sm backdrop-blur-sm  "bg-gradient-to-r from-gray-100 via-white to-gray-50 text-gray-900" ${msg.own ? "" : "px-4 py-2"}`}
                                            >
                                                {msg.loading ? (
                                                    <div className="min-w-[100px]">
                                                        <LoadingDots bg="slate-300" />
                                                    </div>
                                                ) : (
                                                    !msg.own && (msg.text)
                                                )}
                                                {msg.status && (
                                                    <div className="float-right flex flex-row items-center gap-2 p-1 bg-green-800 rounded-md">
                                                        <FaCheck className="text-green-500" size={10} />
                                                        <span className="text-slate-100 text-[10px]">Answered</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={scrollRef} />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="border-t bg-gradient-to-r from-white via-gray-50 to-white/90 p-6 shadow-inner rounded-t-2xl">
                        {!started ? (
                            <div className="flex justify-center">
                                <Button onClick={handleStart} className="w-full max-w-xs text-lg py-6 rounded-xl shadow-md">
                                    Start Camera Check
                                </Button>
                            </div>
                        ) : !sessionId ? (
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
                            </div>
                        ) : !showCompletionScreen && (
                            <div className="flex flex-col items-center gap-6 w-full">
                                {isProcessingFinalResponse && (
                                    <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="text-blue-800 font-medium">
                                                Processing your final response...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap justify-center gap-4">
                                    {(!recognizedText || isListening) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={handleMic}
                                                        className={`w-36 h-12 flex items-center justify-center rounded-xl text-base transition-all duration-300 shadow-sm relative ${isListening
                                                            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105"
                                                            : "bg-primary text-white hover:bg-primary/90"
                                                            }`}
                                                        disabled={isSpeaking || (!micEnabled && !isListening) || isProcessingResponse || isProcessingFinalResponse}
                                                    >
                                                        <FaMicrophone className="mr-2" />
                                                        {(loading || isListening) && <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-gray-100" />}
                                                        {isListening ? "Stop" : "Answer"}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {isListening ? "Click to stop recording" : "Click to start recording"}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}

                                    {recognizedText && !isListening && (
                                        <Button
                                            onClick={submitAnswer}
                                            className="w-36 h-12 text-base rounded-xl shadow-sm"
                                            disabled={loading || isSpeaking || isProcessingResponse || isProcessingFinalResponse}
                                        >
                                            {isProcessingResponse || loading ? (
                                                <div className="flex items-center gap-2">
                                                    <LoadingDots bg="slate-300" />
                                                </div>
                                            ) : (
                                                "Submit"
                                            )}
                                        </Button>
                                    )}

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-36 h-12 text-base rounded-xl shadow-sm"
                                                disabled={loading || isSpeaking || isEndingInterview || isProcessingResponse || isProcessingFinalResponse}
                                            >
                                                End Interview
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>End Interview Early?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to end the interview now? Your responses will be evaluated based on the questions you've answered so far.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={endInterviewEarly}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    End Interview
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-center mt-4">
                                <div className="text-red-600 font-medium mb-3">
                                    {error}
                                </div>
                                {showCameraRetry && (
                                    <div className="space-y-3">
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-amber-900 mb-2">How to enable camera access:</h4>
                                            <ul className="text-sm text-amber-800 space-y-1">
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

                    {/* Submission Modal */}
                    <SubmissionModal
                        open={showSubmissionModal}
                        onOpenChange={setShowSubmissionModal}
                        submissionStep={submissionStep}
                        uploadProgress={uploadProgress}
                        evaluationStatus={evaluationStatus}
                    />
                </>
            )}

            {/* Completion Screen */}
            {showCompletionScreen && (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-white">
                    <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
                            >
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                                    Interview Completed Successfully!
                                </CardTitle>
                                <p className="text-lg text-gray-600 leading-relaxed">
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
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <h3 className="font-semibold text-blue-900 mb-3 text-lg">What happens next?</h3>
                                    <div className="space-y-3 text-left">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">1</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-blue-800 font-medium">Evaluation in Progress</p>
                                                <p className="text-blue-700 text-sm">Our team is analyzing your communication skills and responses.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">2</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-blue-800 font-medium">Results Notification</p>
                                                <p className="text-blue-700 text-sm">You'll receive an email with your evaluation results within 24-48 hours.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">3</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-blue-800 font-medium">Next Steps</p>
                                                <p className="text-blue-700 text-sm">If selected, you'll be contacted for the next stage of the hiring process.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <p className="text-green-800 font-medium">
                                        💡 While you wait, feel free to explore other job opportunities or update your profile!
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => router.push('/')}
                                        className="w-full sm:w-auto h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                                    >
                                        Go to Home
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/home/careers')}
                                        variant="outline"
                                        className="w-full sm:w-auto h-12 text-base font-semibold"
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
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-white">
                    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                                <FaFileAlt className="w-8 h-8 text-amber-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Resume Update Required
                            </CardTitle>
                            <p className="text-gray-600">
                                Please upload your latest resume to continue with the interview
                            </p>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Your resume information needs to be updated to ensure we have the most current details for your interview evaluation.
                                </p>
                                <Button
                                    onClick={() => setShowResumeUploadModal(true)}
                                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
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
        </div>
    );
}

export default CommunicationInterview;