"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaRedo, FaArrowRight } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loadingDots";
import { generateInterviewQuestions, evaluateInterview, QAPair } from "@/lib/interviewService";
import { textInAudioOut } from "@/lib/voiceBot";
import Penguine from "@/../public/assets/icons/penguin_2273664.png";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";

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
        };
    }, []);

    // Start interview: fetch questions
    const handleStart = async () => {
        setLoading(true);
        setError(null);
        const profile_id = localStorage.getItem('profile_id');
        if (!profile_id) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }
        console.log("profile_id", profile_id);
        console.log("searchParams", searchParams?.get('role'));
        try {
            const res = await generateInterviewQuestions({
                posting_title: searchParams?.get('role') as string || "",
                profile_id: profile_id
            });

            if (!res.questions || res.questions.length === 0) {
                throw new Error("No questions were generated");
            }

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

            // Start the interview
            setStarted(true);
            await askQuestion(0);
        } catch (err: any) {
            console.error("Error starting interview:", err);
            setError(err.message || "Failed to start interview");
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

            // Speak the question
            await textInAudioOut(
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
            setError("Azure Speech Services configuration is missing");
            return;
        }

        if (isListening) {
            // Stop listening
            if (recognizerRef.current) {
                try {
                    await recognizerRef.current.stopContinuousRecognitionAsync();
                    setIsListening(false);
                    // Remove loading state when stopping recording
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
        // Remove loading state when starting recording
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
                    // Append new text to existing response
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

    // Submit answer
    const submitAnswer = async () => {
        if (!recognizedText.trim()) return;

        const isLastQuestion = currentQ === questionsRef.current.length - 1;
        setIsSubmitting(true);

        // Create the new QA pair
        const newQAPair = {
            question: questionsRef.current[currentQ],
            answer: recognizedText
        };

        // Update messages
        setMessages((prev) => [...prev, {
            own: true,
            text: recognizedText,
            icon: <FaUser className="text-secondary w-6 h-6" />,
            status: retakeCount[currentQ] > 0 ? 'retaken' : 'completed'
        }]);

        // Update QA pairs and wait for the update
        await new Promise<void>((resolve) => {
            setQaPairs((prev) => {
                const updated = [...prev, newQAPair];
                resolve();
                return updated;
            });
        });

        setRecognizedText("");
        setIsListening(false);
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
            // For last question, proceed to evaluation
            setSubmissionSuccess(false);
            setIsSubmitting(false);
            // Get the latest qaPairs before evaluation
            const currentQAPairs = [...qaPairs, newQAPair];
            evaluateInterviewResults(currentQAPairs);
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

    // Evaluate interview results
    const evaluateInterviewResults = async (qaPairsToEvaluate: QAPair[] = qaPairs) => {
        const profile_id = localStorage.getItem('profile_id');
        if (!profile_id) {
            setError("No profile ID found");
            return;
        }

        setIsSubmitting(true);
        console.log("Evaluating qaPairs:", qaPairsToEvaluate);
        try {
            const res = await evaluateInterview({
                qa_pairs: qaPairsToEvaluate,
                user_id: profile_id,
            });
            if (res && res.interview_summary) {
                setIsSubmitting(false);
                setSubmissionSuccess(true);
                setShowResults(true);
                // if (res.interview_summary.audio_interview_status) {
                //     setShowResults(true);
                // }
            }
        } catch (err: any) {
            setError(err.message || "Failed to evaluate interview");
        } finally {
            setLoading(false);
            setIsListening(false);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Submission State Modal */}
            <AnimatePresence>
                {((isSubmitting || submissionSuccess || loading) && !isListening) && (
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
                            {loading ? (
                                <>
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <h3 className="text-xl font-semibold text-primary">
                                        {showResults ? "Evaluating Interview..." : "Loading Question..."}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {showResults
                                            ? "Please wait while we evaluate your interview"
                                            : "Please wait while we prepare the next question"}
                                    </p>
                                </>
                            ) : isSubmitting ? (
                                <>
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <h3 className="text-xl font-semibold text-primary">Submitting Answer...</h3>
                                    <p className="text-muted-foreground">Please wait while we process your response</p>
                                </>
                            ) : submissionSuccess && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                                    >
                                        <FaCheck className="w-8 h-8 text-green-600" />
                                    </motion.div>
                                    <motion.h3
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-xl font-semibold text-green-600"
                                    >
                                        Answers Submitted!
                                    </motion.h3>
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex flex-row items-center gap-2 text-accent-foreground bg-slate-400 px-4 py-2 rounded-md"
                                        onClick={() => {
                                            setSubmissionSuccess(false);
                                        }}
                                    >
                                        Done <FaCheck />
                                    </motion.button>
                                </>
                            )}
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
                    <div className="font-bold text-lg text-indigo-600 tracking-tight">AI Interviewer</div>
                    <div className="text-xs text-muted-foreground">Voice Interview Simulation</div>
                </div>

                {started && (
                    <div className="ml-auto flex flex-col items-end">
                        <Progress
                            value={currentQ === questions.length - 1 ? 100 : (currentQ / questions.length) * 100}
                            className="w-36 h-2 rounded-full bg-slate-200"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Question <span className="font-medium text-indigo-600">{currentQ + 1}</span> of {questions.length}
                        </div>
                    </div>
                )}
            </div>


            {/* Main Content */}
            {
                showResults ? (
                    <AnimatedPlaceholder
                        onStart={() => {
                            router.push("/interview/communication");
                        }}
                        title="Thank you for your interview!"
                        description="Click the button below to continue to next interview."
                        buttonText="Continue to next interview"
                    />
                ) : (

                    <div className="flex-1 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
                        <div className="h-full flex flex-col sm:flex-row">

                            {/* Question Progress */}
                            {started ? (
                                <div className="w-full sm:w-56 m-4 flex-grow-0 border-1 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 p-5 shadow-inner overflow-y-auto">
                                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Questions</h3>
                                    <div className="space-y-3 gap-4">
                                        {questions.map((q, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 text-sm transition-all ${i === currentQ
                                                    ? "text-indigo-600 font-semibold"
                                                    : i < currentQ || (i === currentQ && qaPairs.length > currentQ)
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {i < currentQ || (i === currentQ && qaPairs.length > currentQ) ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                                                )}
                                                <span className="truncate">Q{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <AnimatedPlaceholder
                                        onStart={handleStart}
                                        title="Ready for Your Interview?"
                                        description="Click the button below to begin your interview."
                                        buttonText="Start Interview"
                                    />
                                </div>
                            )}


                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
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
                                                {msg.text}
                                                {msg.status && (
                                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                                                        {msg.status === "completed" ? (
                                                            <FaCheck className="text-green-500" />
                                                        ) : (
                                                            <FaRedo className="text-blue-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && <LoadingDots bg="#e0e7ff" logo={Penguine} />}
                                <div ref={scrollRef} />
                            </div>
                        </div>
                    </div>
                )}

            {/* Controls */}
            <div className="border-t bg-gradient-to-r from-white via-gray-50 to-white/90 p-6 shadow-inner rounded-t-2xl">
                {!started ? (
                    // <div className="flex justify-center">
                    //     <Button onClick={handleStart} className="w-full max-w-xs text-lg py-6 rounded-xl shadow-md">
                    //         Start Interview
                    //     </Button>
                    // </div>
                    <></>
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
                                                disabled={isSpeaking || (!micEnabled && !isListening)}
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
                                <div className="flex gap-3">
                                    <Button
                                        onClick={submitAnswer}
                                        className="w-36 h-12 text-base rounded-xl shadow-sm"
                                        disabled={loading || isSpeaking || isSubmitting}
                                    >
                                        {retakeCount[currentQ] > 0 ? "Next" : "Submit"}
                                    </Button>
                                    {retakeCount[currentQ] === 0 && !isSubmitting && !submissionSuccess && (
                                        <Button
                                            onClick={retakeAnswer}
                                            variant="outline"
                                            className="w-36 h-12 text-base rounded-xl shadow-sm"
                                            disabled={loading || isSpeaking}
                                        >
                                            Retake
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-center mt-4 font-medium">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

