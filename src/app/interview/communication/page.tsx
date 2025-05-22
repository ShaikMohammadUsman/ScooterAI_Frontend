"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserVideo } from './components/UserVideo';
import { startConversationalInterview, continueConversationalInterview, uploadInterviewVideo, evaluateCommunication } from '@/lib/interviewService';
import { textInAudioOut } from '@/lib/voiceBot';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaUser, FaUserTie, FaCheck } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingDots } from "@/components/ui/loadingDots";
import { SubmissionModal } from "./components/SubmissionModal";

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

// Update the interface to match the API response
interface ConversationalInterviewResponse {
    session_id: string;
    trait?: string;
    question?: string;
    step?: string;
    status?: string;
    message?: string;
}

function CommunicationInterview() {
    const router = useRouter();
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
    const [showResults, setShowResults] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEndingInterview, setIsEndingInterview] = useState(false);
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'processing' | 'uploading' | 'evaluating'>('processing');
    const [uploadProgress, setUploadProgress] = useState(0);
    const recognizerRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeError, setResumeError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Start interview with camera check
    const handleStart = async () => {
        setLoading(true);
        setError(null);
        const profile_id = localStorage.getItem('profile_id');
        if (!profile_id) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }

        try {
            // Start with a test question for camera check
            const testQuestion = "Hi, how are you? Please upload your resume to continue.";
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

    // Handle resume file selection
    const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setResumeError(null);

        if (file) {
            if (file.type !== 'application/pdf') {
                setResumeError("Please upload a PDF file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setResumeError("File size should be less than 5MB");
                return;
            }
            setResumeFile(file);
        }
    };

    // Start actual interview after camera check
    const startActualInterview = async () => {
        if (!resumeFile) {
            setResumeError("Please upload your resume to continue");
            return;
        }

        setLoading(true);
        setIsProcessingResponse(true);
        setError(null);
        const profile_id = localStorage.getItem('profile_id');
        if (!profile_id) {
            setError("No profile ID found");
            setLoading(false);
            setIsProcessingResponse(false);
            return;
        }

        try {
            // Start video recording
            await startRecording();

            const res = await startConversationalInterview({
                file: resumeFile,
                role: "communication",
                user_id: profile_id
            });

            if (res.status === "failed") {
                setError(res?.message || "Failed to start interview");
                setLoading(false);
                setIsProcessingResponse(false);
                return;
            }
            setSessionId(res.session_id);
            setCurrentQuestion(res.question);

            // Add loading message
            setMessages((prev) => [...prev, {
                own: false,
                text: "",
                icon: <FaUserTie className="text-primary w-6 h-6" />,
                loading: true
            }]);

            // Speak the question
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
                    setIsListening(false);
                    setLoading(false);
                } catch (error) {
                    console.error("Error stopping recognition:", error);
                    setError("Failed to stop recording");
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
            if (res.status === "completed") {
                setIsSubmittingFinal(true);
                setShowSubmissionModal(true);
                setSubmissionStep('processing');
                setUploadProgress(0);

                // Stop recording and get final video
                const videoBlob = await stopRecording();
                const profile_id = localStorage.getItem('profile_id');

                if (profile_id) {
                    // Upload the complete video
                    setIsUploadingVideo(true);
                    setSubmissionStep('uploading');

                    await uploadInterviewVideo({
                        file: new File([videoBlob], `interview_${Date.now()}.webm`, {
                            type: 'video/webm;codecs=vp9,opus'
                        }),
                        user_id: profile_id,
                        onProgress: (progress) => {
                            setUploadProgress(Math.round(progress * 100));
                        }
                    });

                    // Evaluate communication
                    setSubmissionStep('evaluating');
                    await evaluateCommunication(sessionId);
                }

                // Add completion message to chat
                setMessages((prev) => [...prev, {
                    own: false,
                    text: res.message || "Thank you for completing the interview. Your responses have been recorded.",
                    icon: <FaUserTie className="text-primary w-6 h-6" />
                }]);

                cleanupRecording();
                setShowResults(true);
                return;
            }

            // If interview is not completed, continue with next question
            setCurrentQuestion(res.question);
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

        try {
            // Stop recording
            const videoBlob = await stopRecording();
            const profile_id = localStorage.getItem('profile_id');

            if (profile_id) {
                // Upload the complete video
                setIsUploadingVideo(true);
                setSubmissionStep('uploading');

                await uploadInterviewVideo({
                    file: new File([videoBlob], `interview_${Date.now()}.webm`, {
                        type: 'video/webm;codecs=vp9,opus'
                    }),
                    user_id: profile_id
                });

                // Evaluate communication
                setSubmissionStep('evaluating');
                await evaluateCommunication(sessionId);
            }

            setShowResults(true);
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

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="text-primary w-12 h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div>
                    <div className="font-bold text-lg text-indigo-600 tracking-tight">Communication Skills Interview</div>
                    <div className="text-xs text-muted-foreground">Video Interview Simulation</div>
                </div>
            </div>

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
                                    className={`flex items-start gap-3 mb-3 ${msg.own ? "justify-end" : "justify-start"}`}
                                >
                                    <div className="flex-shrink-0">{msg.icon}</div>
                                    <div
                                        className={`rounded-2xl px-4 py-2 max-w-[80%] relative shadow-sm backdrop-blur-sm ${msg.own
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                                            : "bg-gradient-to-r from-gray-100 via-white to-gray-50 text-gray-900"
                                            }`}
                                    >
                                        {msg.loading ? (
                                            <div className="min-w-[100px]">
                                                <LoadingDots bg="slate-300" />
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                        {msg.status && (
                                            <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                                                <FaCheck className="text-green-500" />
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
                        <div className="w-full max-w-md space-y-4">
                            <Label htmlFor="resume" className="text-lg font-semibold">
                                Upload Your Resume (PDF)
                            </Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="resume"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleResumeChange}
                                    ref={fileInputRef}
                                    className="flex-1"
                                />
                                {resumeFile && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setResumeFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            {resumeError && (
                                <p className="text-red-500 text-sm">{resumeError}</p>
                            )}
                            {resumeFile && (
                                <p className="text-green-500 text-sm">
                                    Resume uploaded: {resumeFile.name}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={startActualInterview}
                            className="w-full max-w-xs text-lg py-6 rounded-xl shadow-md"
                            disabled={!resumeFile || loading || isProcessingResponse}
                        >
                            {isProcessingResponse ? (
                                <div className="flex items-center gap-2">
                                    <LoadingDots bg="slate-300" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Start Interview"
                            )}
                        </Button>
                    </div>
                ) : !showResults && (
                    <div className="flex flex-col items-center gap-6 w-full">
                        {recognizedText && (
                            <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-3 rounded-2xl text-sm text-indigo-800 border border-indigo-200 shadow-sm">
                                <span className="font-semibold text-indigo-600">You:</span> {recognizedText}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-4">
                            {(!recognizedText || isListening) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={handleMic}
                                                className={`w-36 h-12 flex items-center justify-center rounded-xl text-base transition-colors shadow-sm ${isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
                                                disabled={isSpeaking || (!micEnabled && !isListening) || isProcessingResponse}
                                            >
                                                <FaMicrophone className="mr-2" />
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
                                    disabled={loading || isSpeaking || isProcessingResponse}
                                >
                                    {isProcessingResponse ? (
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
                                        disabled={loading || isSpeaking || isEndingInterview || isProcessingResponse}
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
                    <div className="text-red-600 text-center mt-4 font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            <SubmissionModal
                open={showSubmissionModal}
                onOpenChange={setShowSubmissionModal}
                submissionStep={submissionStep}
                uploadProgress={uploadProgress}
            />
        </div>
    );
}

export default CommunicationInterview;