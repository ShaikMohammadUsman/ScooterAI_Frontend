"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaRedo, FaArrowRight, FaUpload, FaSignOutAlt } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loadingDots";
import { generateInterviewQuestions, evaluateInterview, QAPair, uploadInterviewAudio, SupportedLanguageCode, SUPPORTED_LANGUAGES } from "@/lib/interviewService";
import { candidateAudioInterview, evaluateAudioInterview, updateAudioProctoringLogs } from "@/lib/candidateService";
import { textInAudioOut, resetSynthesizer } from "@/lib/voiceBot";
import { InterviewAudioRecorder } from "@/lib/audioRecorder";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";
import { toast } from "@/hooks/use-toast";
import ProctoringSystem, { ProctoringSystemRef } from "@/components/interview/ProctoringSystem";
import { GeneralInterviewControls } from "./components/GeneralInterviewControls";
import { GeneralQuestionPalette } from "./components/GeneralQuestionPalette";
import { GeneralSubmissionModal } from "./components/GeneralSubmissionModal";
import AISpeakingAnimation from "@/components/interview/AISpeakingAnimation";
import ChatPanel from "@/components/interview/ChatPanel";
import BrowserWarningModal from "@/components/interview/BrowserWarningModal";

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

export default function VoiceInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const applicationId = searchParams?.get('application_id');
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const questionsRef = useRef<string[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [currentQuestionFromAPI, setCurrentQuestionFromAPI] = useState<string>('');
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
    // const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode; status?: 'completed' | 'retaken' }[]>([]);
    const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode; status?: 'completed' }[]>([]);
    const [micEnabled, setMicEnabled] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    // const [retakeCount, setRetakeCount] = useState<number[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognizerRef = useRef<any>(null);
    const recognizedTextRef = useRef<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [passed, setPassed] = useState(false);
    const [recognizing, setRecognizing] = useState(false);

    // Proctoring states
    const [proctoringActive, setProctoringActive] = useState(false);
    const [proctoringViolations, setProctoringViolations] = useState<string[]>([]);
    const proctoringRef = useRef<ProctoringSystemRef>(null);

    // Audio recording states
    const audioRecorderRef = useRef<InterviewAudioRecorder | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Submission states
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'processing' | 'uploading' | 'evaluating'>('processing');
    const [evaluationStatus, setEvaluationStatus] = useState<string>('');

    // Theme transition state
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [showBrowserWarning, setShowBrowserWarning] = useState(false);

    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");

    // New UI states for consistent design
    const [showChat, setShowChat] = useState(false);

    // Mic permission checker (mobile-friendly)
    const [showPermissionChecker, setShowPermissionChecker] = useState(false);
    const [micPermissionStatus, setMicPermissionStatus] = useState<'not-requested' | 'checking' | 'granted' | 'denied' | 'unsupported'>('not-requested');
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const checkMicPermission = async (): Promise<boolean> => {
        setShowPermissionChecker(true);
        setPermissionError(null);
        setMicPermissionStatus('checking');

        try {
            if (typeof window === 'undefined' || typeof navigator === 'undefined') {
                setMicPermissionStatus('unsupported');
                setPermissionError('Microphone is only available in the browser runtime.');
                return false;
            }
            const mediaDevices = (navigator as any).mediaDevices as MediaDevices | undefined;
            if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') {
                setMicPermissionStatus('unsupported');
                setPermissionError('This browser does not support microphone access. On iOS, use Safari. Ensure HTTPS.');
                return false;
            }

            const testStream = await mediaDevices.getUserMedia({ audio: true });
            testStream.getTracks().forEach(t => t.stop());
            setMicPermissionStatus('granted');
            return true;
        } catch (e: any) {
            console.warn('[General] Mic permission error:', e?.name || e, e?.message || '');
            setMicPermissionStatus('denied');
            setPermissionError('Microphone permission denied. Please allow mic access and try again.');
            return false;
        }
    };
    const [speechDuration, setSpeechDuration] = useState(0);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

    // Leave confirmation dialog
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

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
        // console.log(`Interview Event: ${event}`, newEvent);
    };

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.stopContinuousRecognitionAsync();
            }
            if (audioRecorderRef.current) {
                audioRecorderRef.current.cleanup();
            }
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
        // setProctoringData(prev => ({ // This line is removed
        //     ...prev,
        //     violations: [...prev.violations, violation]
        // }));
    };

    // Handle proctoring data updates
    // const handleProctoringDataUpdate = (data: { // This function is removed
    //     tabSwitchCount?: number;
    //     windowFocusCount?: number;
    //     rightClickCount?: number;
    //     devToolsCount?: number;
    //     multiTouchCount?: number;
    //     swipeGestureCount?: number;
    //     orientationChangeCount?: number;
    // }) => {
    //     setProctoringData(prev => ({
    //         ...prev,
    //         ...data
    //     }));
    // };

    // Handle question narration start
    const handleQuestionNarrationStart = (questionIndex: number, question: string) => {
        addInterviewEvent('question_narration_started', {
            questionIndex,
            question,
            timestamp: new Date()
        });
    };

    // Handle question narration end
    const handleQuestionNarrationEnd = (questionIndex: number) => {
        addInterviewEvent('question_narration_ended', {
            questionIndex,
            timestamp: new Date()
        });
    };

    // Handle answer start
    const handleAnswerStart = (questionIndex: number) => {
        addInterviewEvent('answer_started', {
            questionIndex,
            timestamp: new Date()
        });
    };

    // Handle answer end
    const handleAnswerEnd = (questionIndex: number, answer: string) => {
        addInterviewEvent('answer_ended', {
            questionIndex,
            answerLength: answer.length,
            timestamp: new Date()
        });
    };

    // Start interview: fetch questions
    const handleStart = async (language: string = "en-IN") => {
        setLoading(true);
        setError(null);

        // Store the selected language
        setSelectedLanguage(language as SupportedLanguageCode);

        // Reset synthesizer to ensure clean initialization with new language
        await resetSynthesizer();

        if (!applicationId) {
            setError("No application ID found");
            setLoading(false);
            return;
        }

        try {
            // Start candidate audio interview
            const res = await candidateAudioInterview({
                application_id: applicationId
            });

            if (!res.status) {
                setError(res.message || "Failed to start interview");
                toast({
                    title: "Alert",
                    description: res.message || "Failed to start interview",
                    variant: "destructive",
                });
                return;
            }

            // Initialize audio recorder
            audioRecorderRef.current = new InterviewAudioRecorder();

            // Reset all states
            setStarted(false);
            setCurrentQ(0);
            setQaPairs([]);
            setMessages([]);
            setShowResults(false);
            setIsInterviewComplete(false);

            // Ensure microphone permission first
            const micOk = await checkMicPermission();
            if (!micOk) {
                setLoading(false);
                return;
            }

            // Set the first question from API
            setCurrentQuestionFromAPI(res.question || '');
            setQuestions([res.question || '']); // For compatibility with existing UI
            questionsRef.current = [res.question || ''];

            // Activate proctoring when starting the interview (user gesture)
            setProctoringActive(true);
            addInterviewEvent('interview_started', { timestamp: new Date() });

            // Wait for proctoring to be fully activated before proceeding
            await new Promise(resolve => setTimeout(resolve, 100));

            // Trigger dark theme transition after successful question generation
            setTimeout(() => {
                setIsDarkTheme(false);
            }, 500); // Small delay for smooth transition

            // Start the interview
            setStarted(true);
            await askQuestion(0, language as SupportedLanguageCode, res.question || '');
        } catch (err: any) {
            console.error("Error starting interview:", err);
            setError(err.message || "Failed to start interview");
            // Deactivate proctoring on error
            setProctoringActive(false);
        } finally {
            setLoading(false);
        }
    };

    // Ask question with TTS
    const askQuestion = async (index: number, language?: SupportedLanguageCode, questionText?: string) => {
        // Use the passed question text or fall back to currentQuestionFromAPI
        const question = questionText || currentQuestionFromAPI;
        if (!question) {
            return;
        }

        // Use passed language or fall back to selectedLanguage
        const questionLanguage = language || selectedLanguage;
        // console.log(`askQuestion called with language: ${questionLanguage}`);

        setMicEnabled(false);
        setLoading(true);
        setIsSpeaking(true);

        // Track question narration start
        handleQuestionNarrationStart(index, question);

        try {
            // Add question to chat
            setMessages((prev) => [...prev, {
                own: false,
                text: question,
                icon: <FaUserTie className="text-primary w-6 h-6" />
            }]);

            // Add TTS segment to audio recorder
            if (audioRecorderRef.current) {
                audioRecorderRef.current.addTTSSegment(question);
            }

            // Speak the question
            const duration = await textInAudioOut(
                question,
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
                setIsSpeaking,
                questionLanguage
            );
            setSpeechDuration(duration || 0);

            // Track question narration end
            handleQuestionNarrationEnd(index);

            setIsSpeaking(false);
            setMicEnabled(true);
            setSubmissionSuccess(false);
            setIsSubmitting(false);
        } catch (error) {
            console.error("Error in askQuestion:", error);
            setError("Failed to ask question. Please try again.");
            setIsSpeaking(false);
            setLoading(false);
            setSubmissionSuccess(false);
            setIsSubmitting(false);
        }
    };

    // Handle user's answer (STT)
    const handleMic = async () => {
        if (!SPEECH_KEY || !SPEECH_REGION) {
            setError("Speech Services configuration is missing");
            return;
        }

        if (recognizing) {
            // Stop listening
            if (recognizerRef.current) {
                try {
                    await recognizerRef.current.stopContinuousRecognitionAsync();
                    setIsListening(false);
                    // Keep recognizing true until we get the final result
                    setLoading(false);
                } catch (error) {
                    console.error("Error stopping recognition:", error);
                    setError("Failed to stop recording");
                    setRecognizing(false);
                }
            }
            return;
        }

        // Start listening
        setIsListening(true);
        setRecognizedText("");
        recognizedTextRef.current = "";
        setRecognizing(true);
        // Remove loading state when starting recording
        setLoading(false);

        // Track answer start
        handleAnswerStart(currentQ);

        // Start audio recording for user response
        if (audioRecorderRef.current) {
            try {
                await audioRecorderRef.current.startUserRecording();
            } catch (error) {
                console.error("Error starting audio recording:", error);
                // Continue with speech recognition even if audio recording fails
            }
        }

        try {
            const speechConfig = speechsdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);

            // Get the speech recognition language for the selected language
            const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
            const recognitionLanguage = languageConfig?.speechRecognition || "en-IN";
            speechConfig.speechRecognitionLanguage = recognitionLanguage;

            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
            recognizerRef.current = recognizer;

            recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    const answer = e.result.text;
                    // Append new text to existing response
                    setRecognizedText(prev => {
                        const newText = prev ? `${prev} ${answer}` : answer;
                        recognizedTextRef.current = newText;
                        return newText;
                    });
                }
            };

            recognizer.canceled = (s, e) => {
                setIsListening(false);
                setLoading(false);
                if (e.reason === speechsdk.CancellationReason.Error) {
                    setError(`Speech recognition error: ${e.errorDetails}`);
                }
                // Only set recognizing to false when recognition is completely stopped
                setRecognizing(false);
            };

            // Add session stopped event handler
            recognizer.sessionStopped = (s, e) => {
                // Set recognizing to false when the session is completely stopped
                setRecognizing(false);

                // Auto-submit the answer if there's recognized text
                setTimeout(() => {
                    if (recognizedTextRef.current.trim()) {
                        submitAnswer();
                    }
                }, 100); // Small delay to ensure state is updated
            };

            await recognizer.startContinuousRecognitionAsync();
        } catch (err: any) {
            console.error("Speech recognition error:", err);
            setError(err.message || "Speech recognition failed");
            setIsListening(false);
            setLoading(false);
            setRecognizing(false);
        }
    };

    // Submit answer
    const submitAnswer = async () => {
        const currentRecognizedText = recognizedTextRef.current || recognizedText;
        if (!currentRecognizedText.trim() || !applicationId) return;

        setIsSubmitting(true);

        // Track answer end
        handleAnswerEnd(currentQ, currentRecognizedText);

        // Stop audio recording for user response
        if (audioRecorderRef.current) {
            audioRecorderRef.current.stopUserRecording();
        }

        // Create the new QA pair
        const newQAPair = {
            question: currentQuestionFromAPI || '',
            answer: currentRecognizedText
        };

        // Update messages
        setMessages((prev) => {
            const newMessages = [...prev];
            // Find and mark the current question as completed
            let questionCount = 0;
            for (let i = 0; i < newMessages.length; i++) {
                if (!newMessages[i].own) {
                    if (questionCount === currentQ) {
                        newMessages[i].status = 'completed';
                        break;
                    }
                    questionCount++;
                }
            }
            // Add the user's answer
            newMessages.push({
                own: true,
                text: currentRecognizedText,
                icon: <FaUser className="text-secondary w-6 h-6" />,
                // status: retakeCount[currentQ] > 0 ? 'retaken' : 'completed'
                status: 'completed'
            });
            return newMessages;
        });

        // Update QA pairs and wait for the update
        await new Promise<void>((resolve) => {
            setQaPairs((prev) => {
                const updated = [...prev, newQAPair];
                resolve();
                return updated;
            });
        });

        setRecognizedText("");
        recognizedTextRef.current = "";
        setIsListening(false);
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync();
        }

        // Show submission success briefly
        setSubmissionSuccess(true);

        try {
            // Submit answer to candidate audio interview API
            const res = await candidateAudioInterview({
                application_id: applicationId,
                answer: currentRecognizedText.trim()
            });

            if (res.status) {
                // Check if interview is complete
                if (res.done) {
                    // Interview is complete, proceed to evaluation
                    setSubmissionSuccess(false);
                    setIsSubmitting(false);
                    setIsInterviewComplete(true);
                    const currentQAPairs = [...qaPairs, newQAPair];
                    await evaluateInterviewResults(currentQAPairs);
                } else {
                    // Get next question
                    setCurrentQuestionFromAPI(res.question || '');
                    setQuestions([res.question || '']); // For compatibility
                    questionsRef.current = [res.question || ''];

                    // Move to next question
                    const nextQ = currentQ + 1;
                    setSubmissionSuccess(false);
                    setIsSubmitting(false);

                    // Ask the next question (this will add the question to messages)
                    await askQuestion(nextQ, selectedLanguage, res.question || '');

                    // Update currentQ after the question is added
                    setCurrentQ(nextQ);
                }
            } else {
                setError(res.message || 'Failed to submit answer');
                setSubmissionSuccess(false);
                setIsSubmitting(false);
            }
        } catch (err: any) {
            console.error("Error submitting answer:", err);
            setError(err?.response?.data?.message || err?.message || 'Failed to submit answer');
            setSubmissionSuccess(false);
            setIsSubmitting(false);
        }
    };


    // // Retake answer
    // const retakeAnswer = () => {
    //     // Allow only one retake per question
    //     if (retakeCount[currentQ] >= 1) return;

    //     setRetakeCount(prev => {
    //         const newCount = [...prev];
    //         newCount[currentQ] = 1;
    //         return newCount;
    //     });

    //     setRecognizedText("");
    // };

    // Handle leave confirmation
    const handleLeaveConfirmation = () => {
        setShowLeaveConfirmation(true);
    };

    // Handle leave interview with submission
    const handleLeaveInterview = async () => {
        setIsLeaving(true);
        setShowLeaveConfirmation(false);

        try {
            // If there's recognized text, submit it first
            if (recognizedText.trim()) {
                await submitAnswer();
            }

            // Submit current progress and audio
            if (applicationId && qaPairs.length > 0) {
                await evaluateInterviewResults(qaPairs);
            } else if (applicationId) {
                // Upload proctoring logs even if no Q&A pairs
                await uploadAudioProctoringLogs(applicationId);
            }

            // Deactivate proctoring and navigate
            setProctoringActive(false);
            router.push("/");
        } catch (error) {
            console.error("Error during leave process:", error);
            setError("Failed to save your progress. Please try again.");
        } finally {
            setIsLeaving(false);
        }
    };

    // Evaluate interview results and upload audio
    const evaluateInterviewResults = async (qaPairsToEvaluate: QAPair[] = qaPairs) => {
        if (!applicationId) {
            setError("No application ID found");
            return;
        }

        // Show submission modal
        setShowSubmissionModal(true);
        setSubmissionStep('processing');
        setEvaluationStatus('');

        try {
            // Processing step
            setSubmissionStep('processing');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

            // Upload audio file and proctoring logs
            setSubmissionStep('uploading');
            if (applicationId) {
                await uploadAudioFile(applicationId);
                // Upload audio proctoring logs
                await uploadAudioProctoringLogs(applicationId);
            }

            // COMMENTED OUT: Evaluate interview results using candidate API
            // setSubmissionStep('evaluating');
            // addInterviewEvent('evaluation_started', { timestamp: new Date() });

            // const evaluationResult = await evaluateAudioInterview({
            //     application_id: applicationId,
            //     qa_pairs: qaPairsToEvaluate,
            // });

            // addInterviewEvent('evaluation_completed', {
            //     timestamp: new Date(),
            //     message: evaluationResult?.message
            // });

            // if (evaluationResult && evaluationResult.status) {
            //     setEvaluationStatus('Evaluation completed successfully!');
            //     await new Promise(resolve => setTimeout(resolve, 1000)); // Show success message

            //     setShowResults(true);
            //     setProctoringActive(false);
            //     if (evaluationResult.qualified_for_video_round) {
            //         setPassed(evaluationResult.qualified_for_video_round);
            //     }
            // } else {
            //     setEvaluationStatus('Evaluation failed. Please try again.');
            // }

            // Skip evaluation for audio round - just complete the interview
            setEvaluationStatus('Audio interview completed successfully!');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Show success message

            setShowResults(true);
            setProctoringActive(false);
        } catch (err: any) {
            setError(err.message || "Failed to complete interview");
            setEvaluationStatus('An error occurred during submission.');
            setProctoringActive(false);
        } finally {
            setLoading(false);
            setIsListening(false);
            setIsSubmitting(false);

            // Close submission modal after a delay
            setTimeout(() => {
                setShowSubmissionModal(false);
            }, 2000);
        }
    };

    // Upload audio file
    const uploadAudioFile = async (application_id: string) => {
        if (!audioRecorderRef.current) {
            console.warn("No audio recorder available");
            return;
        }

        try {
            setIsUploadingAudio(true);
            setUploadProgress(0);
            addInterviewEvent('audio_upload_started', { timestamp: new Date() });

            // Combine audio segments
            const audioFile = await audioRecorderRef.current.combineAudioSegments();

            // Upload the audio file
            await uploadInterviewAudio({
                file: audioFile,
                user_id: application_id,
                onProgress: (progress) => {
                    setUploadProgress(Math.round(progress * 100));
                }
            });

            addInterviewEvent('audio_upload_completed', { timestamp: new Date() });
            console.log("Audio file uploaded successfully");
        } catch (error) {
            console.error("Error uploading audio file:", error);
            addInterviewEvent('audio_upload_failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
            setError("Failed to upload audio file. Please try again.");
        } finally {
            setIsUploadingAudio(false);
        }
    };

    // Upload audio proctoring logs
    const uploadAudioProctoringLogs = async (application_id: string) => {
        try {
            const endTime = new Date();
            const proctoringData = proctoringRef.current?.getProctoringData();
            const duration = proctoringData?.startTime
                ? Math.round((endTime.getTime() - proctoringData.startTime.getTime()) / 1000)
                : 0;

            // Add final submission event
            addInterviewEvent('final_submission_started', { timestamp: new Date() });

            const proctoringLogs = {
                email: localStorage.getItem('userEmail') || "unknown@example.com",
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

            await updateAudioProctoringLogs({
                user_id: application_id,
                audio_proctoring_logs: proctoringLogs
            });

            addInterviewEvent('proctoring_logs_uploaded', { timestamp: new Date() });
            console.log("Audio proctoring logs uploaded successfully");
        } catch (error) {
            console.error("Error uploading audio proctoring logs:", error);
            addInterviewEvent('proctoring_logs_upload_failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
        }
    };

    return (
        <div className={`relative h-screen flex flex-col transition-all duration-1000 ease-in-out ${isDarkTheme ? 'bg-gray-900' : 'bg-background'}`}>
            {/* Proctoring System */}
            {/* {
                proctoringActive && (
                    <ProctoringSystem
                        isActive={proctoringActive}
                        onViolation={handleProctoringViolation}
                        ref={proctoringRef}
                    />
                )
            } */}


            {/* Submission Modal */}
            <GeneralSubmissionModal
                open={showSubmissionModal}
                onOpenChange={setShowSubmissionModal}
                submissionStep={submissionStep}
                uploadProgress={uploadProgress}
                evaluationStatus={evaluationStatus}
            />

            {/* Leave Confirmation Dialog */}
            <AnimatePresence>
                {showLeaveConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`rounded-lg p-6 shadow-xl transition-all duration-1000 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaSignOutAlt className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className={`text-xl font-semibold mb-2 transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                    Leave Interview?
                                </h3>
                                <p className={`mb-6 transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Are you sure you want to leave? Your current progress will be saved and submitted.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={() => setShowLeaveConfirmation(false)}
                                        variant="outline"
                                        disabled={isLeaving}
                                        className="px-6 py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleLeaveInterview}
                                        disabled={isLeaving}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isLeaving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </div>
                                        ) : (
                                            "Leave Interview"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Browser Warning Modal for non-Chrome */}
            <BrowserWarningModal
                open={showBrowserWarning}
                onOpenChange={setShowBrowserWarning}
                targetUrl={`/resume?role=${encodeURIComponent(searchParams.get('role') || '')}&job_id=${searchParams.get('job_id') || ''}`}
            />

            {/* Submitting Answer Overlay */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl transition-all duration-1000 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-bg-main'}`}
                        >

                            <h3 className={`flex items-center gap-2 text-xl font-semibold transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-grad-1'}`}>Submitting <div className="w-8 h-8 border-4 border-grad-1 border-t-transparent rounded-full animate-spin" /></h3>
                            {/* <p className={`text-center transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>
                                Processing your answer...
                            </p> */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Modal for Initial Interview Start */}
            <AnimatePresence>
                {loading && !started && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl transition-all duration-1000 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-bg-main'}`}
                        >
                            <div className="w-16 h-16 border-4 border-grad-1 border-t-transparent rounded-full animate-spin" />
                            <h3 className={`text-xl font-semibold transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-grad-1'}`}>Preparing Your Interview</h3>
                            {/* <p className={`text-center transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>
                                We're generating personalized questions for your role. This may take a few moments...
                            </p> */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            {/* <div className="flex items-center gap-4 px-6 py-4 sticky top-0 z-10">
                <div className="w-12 h-12">
                    <img
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter AI"
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex-1">
                    <div className={`font-bold text-lg tracking-tight transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        Voice Skills Assessment
                    </div>
                    <div className={`text-xs transition-colors duration-1000 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Audio Assessment Simulation
                    </div>
                </div>
            </div> */}

            {/* Main Content */}
            {showResults ? (
                <AnimatedPlaceholder
                    onStart={() => {
                        router.push("/");
                    }}
                    title="Kudos!"
                    description="You've successfully completed your voice assessment."
                    buttonText="Continue to home"
                />
            ) : (
                <>
                    {/* Main Content - AI Speaking Animation */}
                    <div className={`flex-1 overflow-hidden transition-all duration-1000 ease-in-out pb-24 ${isDarkTheme
                        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                        : 'bg-gradient-to-br from-white via-slate-50 to-white'
                        }`}>
                        {!started ? (
                            <div className="flex justify-center items-center h-full">
                                {showPermissionChecker ? (
                                    <div className="max-w-md mx-auto p-6 text-center">
                                        <h2 className="text-2xl font-semibold mb-2">Microphone Access</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">We need your microphone to record your answers.</p>
                                        <div className={`p-4 rounded-lg border mb-4 ${micPermissionStatus === 'granted'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : micPermissionStatus === 'denied'
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : micPermissionStatus === 'unsupported'
                                                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            <p className="text-sm">
                                                {micPermissionStatus === 'granted' && 'Permission granted. You can start the interview.'}
                                                {micPermissionStatus === 'denied' && 'Permission denied. Please allow microphone access and retry.'}
                                                {micPermissionStatus === 'unsupported' && 'Microphone is not supported in this browser/device context.'}
                                                {micPermissionStatus === 'checking' && 'Checking permission...'}
                                                {micPermissionStatus === 'not-requested' && 'Click Retry to request microphone permission.'}
                                            </p>
                                        </div>
                                        {permissionError && (
                                            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{permissionError}</p>
                                        )}
                                        <div className="flex gap-3 justify-center">
                                            {micPermissionStatus === 'granted' ? (
                                                <Button onClick={() => handleStart()} className="bg-green-600 hover:bg-green-700 text-white">Continue</Button>
                                            ) : (
                                                <Button onClick={checkMicPermission} className="bg-blue-600 hover:bg-blue-700 text-white">Retry Permission</Button>
                                            )}
                                        </div>
                                        <div className="mt-4 text-xs text-gray-500">
                                            Tip: On iOS, use Safari. Ensure site is opened over HTTPS.
                                        </div>
                                    </div>
                                ) : (
                                    <AnimatedPlaceholder
                                        onStart={async () => {
                                            const ok = await checkMicPermission();
                                            if (ok) { await handleStart(); }
                                        }}
                                        showIcons={true}
                                        showScheduleLink={true}
                                        title="Let companies hear what makes you great."
                                        description="Start by sharing a little about yourself"
                                        buttonText="I'm ready!"
                                        applicationId={applicationId || ""}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex-1">
                                <AISpeakingAnimation
                                    isSpeaking={isSpeaking}
                                    isProcessing={loading}
                                    currentQuestion={currentQuestionFromAPI || ""}
                                    isDarkTheme={isDarkTheme}
                                    speechDuration={speechDuration}
                                />
                            </div>
                        )}
                    </div>

                    {/* Chat Panel */}
                    {/* <ChatPanel
                        isOpen={showChat}
                        onToggle={() => setShowChat(!showChat)}
                        messages={messages}
                    /> */}

                    {/* Question Palette */}
                    <GeneralQuestionPalette
                        messages={messages}
                        currentQuestionIndex={currentQ}
                    />

                    {/* Interview Controls */}
                    {started && !showResults && (
                        <GeneralInterviewControls
                            isListening={isListening}
                            recognizedText={recognizedText}
                            // retakeCount={retakeCount[currentQ] || 0}
                            onMicToggle={handleMic}
                            onLeave={handleLeaveConfirmation}
                            onChatToggle={() => setShowChat(!showChat)}
                            onSubmitAnswer={submitAnswer}
                            // onRetakeAnswer={retakeAnswer}
                            disabled={loading || isSpeaking || isSubmitting}
                            isDarkTheme={isDarkTheme}
                            isLeaving={isLeaving}
                            micEnabled={micEnabled}
                        />
                    )}
                </>
            )}

            {error && (
                <div className="text-red-600 text-center mt-4 font-medium">
                    {error}
                </div>
            )}
        </div>
    );
}

