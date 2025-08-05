"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaRedo, FaArrowRight, FaUpload } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loadingDots";
import { generateInterviewQuestions, evaluateInterview, QAPair, uploadInterviewAudio } from "@/lib/interviewService";
import { textInAudioOut } from "@/lib/voiceBot";
import { InterviewAudioRecorder } from "@/lib/audioRecorder";
import Penguine from "@/../public/assets/icons/penguin_2273664.png";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";
import { toast } from "@/hooks/use-toast";
import ProctoringSystem from "@/components/interview/ProctoringSystem";
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

    // Audio recording states
    const audioRecorderRef = useRef<InterviewAudioRecorder | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Submission states
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'processing' | 'uploading' | 'evaluating'>('processing');
    const [evaluationStatus, setEvaluationStatus] = useState<string>('');

    // New UI states for consistent design
    const [showChat, setShowChat] = useState(false);
    const [canRetake, setCanRetake] = useState(false);
    const [speechDuration, setSpeechDuration] = useState(0);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

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
    };

    // Start interview: fetch questions
    const handleStart = async () => {
        setLoading(true);
        setError(null);
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
                profile_id: profile_id
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

            // Wait for proctoring to be fully activated before proceeding
            await new Promise(resolve => setTimeout(resolve, 100));

            // Start the interview
            setStarted(true);
            await askQuestion(0);
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
    const askQuestion = async (index: number) => {
        const currentQuestions = questionsRef.current;
        if (!currentQuestions || currentQuestions.length === 0 || index >= currentQuestions.length) {
            return;
        }

        setMicEnabled(false);
        setLoading(true);
        setIsSpeaking(true);
        const question = currentQuestions[index];

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
                setLoading
            );
            setSpeechDuration(duration || 0);

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
            speechConfig.speechRecognitionLanguage = "en-US";
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
                setCanRetake(true);
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

        console.log(qaPairs);

        setRecognizedText("");
        setIsListening(false);
        setCanRetake(false);
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
            askQuestion(nextQ);
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
        if (retakeCount[currentQ] >= 1) return;

        setRetakeCount(prev => {
            const newCount = [...prev];
            newCount[currentQ] = 1;
            return newCount;
        });

        setRecognizedText("");
        setMicEnabled(true);
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

            // Evaluation step
            setSubmissionStep('evaluating');
            const res = await evaluateInterview({
                qa_pairs: qaPairsToEvaluate,
                user_id: profile_id,
            });

            if (res && res.status) {
                setEvaluationStatus('Evaluation completed successfully!');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Show success message

                setShowResults(true);
                setProctoringActive(false);
                if (res.qualified_for_video_round) {
                    setPassed(res.qualified_for_video_round);
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

            console.log("Audio file uploaded successfully");
        } catch (error) {
            console.error("Error uploading audio file:", error);
            setError("Failed to upload audio file");
            throw error; // Re-throw to be handled by the calling function
        } finally {
            setIsUploadingAudio(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Proctoring System */}
            {
                proctoringActive && (
                    <ProctoringSystem
                        isActive={proctoringActive}
                        onViolation={handleProctoringViolation}
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
                            className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl"
                        >
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <h3 className="text-xl font-semibold text-primary">Preparing Your Interview</h3>
                            <p className="text-muted-foreground text-center">
                                We're generating personalized questions for your role. This may take a few moments...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <Image
                    src={Penguine}
                    alt="Bot"
                    className="h-12 w-12 rounded-full border-2 border-indigo-200 shadow-sm"
                />
                <div>
                    <div className="font-bold text-lg text-indigo-600 tracking-tight">Voice Assistant</div>
                    <div className="text-xs text-muted-foreground">Voice Conversation Simulation</div>
                </div>
            </div>

            {/* Main Content */}
            {showResults ? (
                <AnimatedPlaceholder
                    onStart={() => {
                        router.push("/");
                    }}
                    title="Thank you for completing the interview!"
                    description="We will reach out to you soon."
                    buttonText="Continue to home"
                />
            ) : (
                <>
                    {/* Main Content - AI Speaking Animation */}
                    <div className={`flex-1 overflow-hidden transition-all duration-1000 ease-in-out pb-24 bg-gradient-to-br from-white via-slate-50 to-white`}>
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
                                    isDarkTheme={false}
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
                            canRetake={canRetake}
                            retakeCount={retakeCount[currentQ] || 0}
                            onMicToggle={handleMic}
                            onLeave={() => {
                                setProctoringActive(false);
                                router.push("/");
                            }}
                            onChatToggle={() => setShowChat(!showChat)}
                            onSubmitAnswer={submitAnswer}
                            onRetakeAnswer={retakeAnswer}
                            disabled={isSpeaking || loading || isSubmitting}
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

