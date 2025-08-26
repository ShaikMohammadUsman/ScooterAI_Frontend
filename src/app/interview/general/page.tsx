"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaRedo, FaArrowRight, FaUpload, FaSignOutAlt } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loadingDots";
import { generateInterviewQuestions, evaluateInterview, QAPair, uploadInterviewAudio, updateAudioProctoringLogs, SupportedLanguageCode, SUPPORTED_LANGUAGES } from "@/lib/interviewService";
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

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

export default function VoiceInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const questionsRef = useRef<string[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
    const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode; status?: 'completed' | 'retaken' }[]>([]);
    const [micEnabled, setMicEnabled] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [retakeCount, setRetakeCount] = useState<number[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognizerRef = useRef<any>(null);
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

    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");

    // New UI states for consistent design
    const [showChat, setShowChat] = useState(false);
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

        const profile_id = localStorage.getItem('scooterUserId');
        if (!profile_id) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }
        // console.log("profile_id", profile_id);
        // console.log("searchParams", searchParams?.get('role'));
        try {
            const res = await generateInterviewQuestions({
                posting_title: searchParams?.get('role') as string || "",
                profile_id: profile_id,
                language: language
            });


            if (!res.questions || res.questions.length === 0) {
                if (!res.status) {
                    setError(res.message || "Failed to generate interview questions");
                    toast({
                        title: "Alert",
                        description: res.message || "Failed to generate interview questions",
                        variant: "destructive",
                    });
                    return;
                }

                setError("No questions were generated");
                toast({
                    title: "Error",
                    description: "No questions were generated",
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
            setRetakeCount(new Array(res.questions.length).fill(0));

            // Set questions
            setQuestions(res.questions);
            questionsRef.current = res.questions;

            // Activate proctoring when starting the interview (user gesture)
            setProctoringActive(true);
            addInterviewEvent('interview_started', { timestamp: new Date() });

            // Wait for proctoring to be fully activated before proceeding
            await new Promise(resolve => setTimeout(resolve, 100));

            // Trigger dark theme transition after successful question generation
            setTimeout(() => {
                setIsDarkTheme(true);
            }, 500); // Small delay for smooth transition

            // Start the interview
            setStarted(true);
            await askQuestion(0, language as SupportedLanguageCode);
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
    const askQuestion = async (index: number, language?: SupportedLanguageCode) => {
        const currentQuestions = questionsRef.current;
        if (!currentQuestions || currentQuestions.length === 0 || index >= currentQuestions.length) {
            return;
        }

        // Use passed language or fall back to selectedLanguage
        const questionLanguage = language || selectedLanguage;
        // console.log(`askQuestion called with language: ${questionLanguage}`);

        setMicEnabled(false);
        setLoading(true);
        setIsSpeaking(true);
        const question = currentQuestions[index];

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
                    setRecognizedText(prev => prev ? `${prev} ${answer}` : answer);
                }
            };

            recognizer.canceled = (s, e) => {
                setIsListening(false);
                setLoading(false);
                // Don't set canRetake here - it should only be enabled after submitting
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
        if (!recognizedText.trim()) return;

        const isLastQuestion = currentQ === questionsRef.current.length - 1;
        setIsSubmitting(true);

        // Track answer end
        handleAnswerEnd(currentQ, recognizedText);

        // Stop audio recording for user response
        if (audioRecorderRef.current) {
            audioRecorderRef.current.stopUserRecording();
        }

        // Create the new QA pair
        const newQAPair = {
            question: questionsRef.current[currentQ],
            answer: recognizedText
        };

        // Update messages
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
                text: recognizedText,
                icon: <FaUser className="text-secondary w-6 h-6" />,
                status: retakeCount[currentQ] > 0 ? 'retaken' : 'completed'
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

        // console.log(qaPairs);

        setRecognizedText("");
        setIsListening(false);
        // Don't reset canRetake here - let it be reset when moving to next question
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync();
        }

        // Show submission success briefly
        setSubmissionSuccess(true);

        // Move to next question immediately after submission
        if (!isLastQuestion) {
            const nextQ = currentQ + 1;
            setCurrentQ(nextQ);
            // The loading state will be shown during askQuestion
            askQuestion(nextQ, selectedLanguage);
        } else {
            // For last question, proceed to evaluation and audio upload
            setSubmissionSuccess(false);
            setIsSubmitting(false);
            // Get the latest qaPairs before evaluation
            const currentQAPairs = [...qaPairs, newQAPair];
            await evaluateInterviewResults(currentQAPairs);
        }
    };

    // Retake answer
    const retakeAnswer = () => {
        // Allow only one retake per question
        if (retakeCount[currentQ] >= 1) return;

        setRetakeCount(prev => {
            const newCount = [...prev];
            newCount[currentQ] = 1;
            return newCount;
        });

        setRecognizedText("");
    };

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
            const profile_id = localStorage.getItem('scooterUserId');
            if (profile_id && qaPairs.length > 0) {
                await evaluateInterviewResults(qaPairs);
            } else if (profile_id) {
                // Upload proctoring logs even if no Q&A pairs
                await uploadAudioProctoringLogs(profile_id);
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
        const profile_id = localStorage.getItem('scooterUserId');
        if (!profile_id) {
            setError("No profile ID found");
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

            // Upload audio file
            setSubmissionStep('uploading');
            await uploadAudioFile(profile_id);

            // Upload audio proctoring logs
            await uploadAudioProctoringLogs(profile_id);

            // Evaluate interview results
            setSubmissionStep('evaluating');
            addInterviewEvent('evaluation_started', { timestamp: new Date() });

            const evaluationResult = await evaluateInterview({
                qa_pairs: qaPairsToEvaluate,
                user_id: profile_id,
            });

            addInterviewEvent('evaluation_completed', {
                timestamp: new Date(),
                message: evaluationResult?.message
            });

            if (evaluationResult && evaluationResult.status) {
                setEvaluationStatus('Evaluation completed successfully!');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Show success message

                setShowResults(true);
                setProctoringActive(false);
                if (evaluationResult.qualified_for_video_round) {
                    setPassed(evaluationResult.qualified_for_video_round);
                }
            } else {
                setEvaluationStatus('Evaluation failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || "Failed to evaluate interview");
            setEvaluationStatus('An error occurred during evaluation.');
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
    const uploadAudioFile = async (profile_id: string) => {
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
                user_id: profile_id,
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
    const uploadAudioProctoringLogs = async (profile_id: string) => {
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
                user_id: profile_id,
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
        <div className={`h-screen flex flex-col transition-all duration-1000 ease-in-out ${isDarkTheme ? 'bg-gray-900' : 'bg-background'}`}>
            {/* Proctoring System */}
            {
                proctoringActive && (
                    <ProctoringSystem
                        isActive={proctoringActive}
                        onViolation={handleProctoringViolation}
                        ref={proctoringRef}
                    />
                )
            }


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
                            className={`rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl transition-all duration-1000 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
                        >
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <h3 className={`text-xl font-semibold transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-primary'}`}>Preparing Your Interview</h3>
                            <p className={`text-center transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'}`}>
                                We're generating personalized questions for your role. This may take a few moments...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <div className={`font-bold text-lg tracking-tight transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        Voice Skills Assessment
                    </div>
                    <div className={`text-xs transition-colors duration-1000 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Audio Assessment Simulation
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {showResults ? (
                <AnimatedPlaceholder
                    onStart={() => {
                        router.push("/interview/communication?demo=1");
                    }}
                    title="You have completed this round."
                    description="Great job! Now, let’s move to the next round."
                    buttonText="Proceed to Communication Round"
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
                                <AnimatedPlaceholder
                                    onStart={handleStart}
                                    title="Ready to Say Hello?"
                                    description="Click the button below to share a little about yourself"
                                    buttonText="Let's Go"
                                />
                            </div>
                        ) : (
                            <div className="flex-1">
                                <AISpeakingAnimation
                                    isSpeaking={isSpeaking}
                                    isProcessing={loading}
                                    currentQuestion={questionsRef.current[currentQ] || ""}
                                    isDarkTheme={isDarkTheme}
                                    speechDuration={speechDuration}
                                />
                            </div>
                        )}
                    </div>

                    {/* Chat Panel */}
                    <ChatPanel
                        isOpen={showChat}
                        onToggle={() => setShowChat(!showChat)}
                        messages={messages}
                    />

                    {/* Question Palette */}
                    <GeneralQuestionPalette
                        messages={messages}
                    />

                    {/* Interview Controls */}
                    {started && !showResults && (
                        <GeneralInterviewControls
                            isListening={isListening}
                            recognizedText={recognizedText}
                            retakeCount={retakeCount[currentQ] || 0}
                            onMicToggle={handleMic}
                            onLeave={handleLeaveConfirmation}
                            onChatToggle={() => setShowChat(!showChat)}
                            onSubmitAnswer={submitAnswer}
                            onRetakeAnswer={retakeAnswer}
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

