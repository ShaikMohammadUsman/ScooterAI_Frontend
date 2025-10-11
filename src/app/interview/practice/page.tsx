"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie, FaCheck, FaRedo, FaArrowRight, FaUpload } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loadingDots";
import { textInAudioOut } from "@/lib/voiceBot";
import { InterviewAudioRecorder } from "@/lib/audioRecorder";
import Penguine from "@/../public/assets/icons/penguin_2273664.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { AnimatedPlaceholder } from "../general/AnimatedPlaceholder";

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

// Mock questions for practice
const MOCK_QUESTIONS = [
    "Tell me about a time when you exceeded your sales quota. What strategies did you use?",
    "How do you handle objections from potential customers? Can you give me a specific example?",
    "Describe your sales process from prospecting to closing. What tools do you typically use?",
    "What metrics do you track to measure your sales performance?",
    "How do you stay motivated during slow periods or when facing rejection?"
];

interface QAPair {
    question: string;
    answer: string;
    evaluation?: string;
}

export default function PracticeInterviewPage() {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions] = useState<string[]>(MOCK_QUESTIONS);
    const questionsRef = useRef<string[]>(MOCK_QUESTIONS);
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
    const [recognizing, setRecognizing] = useState(false);

    // Audio recording states
    const audioRecorderRef = useRef<InterviewAudioRecorder | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);

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

    // Start practice interview
    const handleStart = async () => {
        setLoading(true);
        setError(null);

        try {
            // Initialize audio recorder
            audioRecorderRef.current = new InterviewAudioRecorder();

            // Reset all states
            setStarted(false);
            setCurrentQ(0);
            setQaPairs([]);
            setMessages([]);
            setShowResults(false);
            setRetakeCount(new Array(questions.length).fill(0));

            // Start the interview
            setStarted(true);
            await askQuestion(0);
        } catch (err: any) {
            console.error("Error starting practice interaction:", err);
            setError(err.message || "Failed to start practice interaction");
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
            setError("Speech Services configuration is missing");
            return;
        }

        if (recognizing) {
            // Stop listening
            if (recognizerRef.current) {
                try {
                    await recognizerRef.current.stopContinuousRecognitionAsync();
                    setIsListening(false);
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

        try {
            const speechConfig = speechsdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
            speechConfig.speechRecognitionLanguage = "en-US";

            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            recognizerRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

            recognizerRef.current.recognizing = (s: any, e: any) => {
                setRecognizedText(e.result.text);
            };

            recognizerRef.current.recognized = (s: any, e: any) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    setRecognizedText(e.result.text);
                    setRecognizing(false);
                    setIsListening(false);
                    setLoading(false);
                }
            };

            recognizerRef.current.canceled = (s: any, e: any) => {
                setRecognizing(false);
                setIsListening(false);
                setLoading(false);
                if (e.reason === speechsdk.CancellationReason.Error) {
                    setError(`Recognition canceled: ${e.errorDetails}`);
                }
            };

            await recognizerRef.current.startContinuousRecognitionAsync();
        } catch (error) {
            console.error("Error starting recognition:", error);
            setError("Failed to start recording");
            setRecognizing(false);
            setIsListening(false);
            setLoading(false);
        }
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!recognizedText.trim()) {
            setError("Please provide an answer before submitting");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Add user's answer to chat
            setMessages((prev) => [...prev, {
                own: true,
                text: recognizedText,
                icon: <FaUser className="text-blue-600 w-6 h-6" />,
                status: 'completed'
            }]);

            // Note: Audio recording is not implemented for practice sessions
            // In a real interview, this would record the user's audio

            // Create QA pair
            const qaPair: QAPair = {
                question: questions[currentQ],
                answer: recognizedText
            };

            setQaPairs((prev) => [...prev, qaPair]);
            setRecognizedText("");

            // Move to next question or finish
            if (currentQ < questions.length - 1) {
                setCurrentQ(currentQ + 1);
                setTimeout(() => askQuestion(currentQ + 1), 1000);
            } else {
                // Practice interview completed
                setSubmissionSuccess(true);
                setTimeout(() => {
                    setShowResults(true);
                }, 2000);
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            setError("Failed to submit answer");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Retake answer
    const retakeAnswer = () => {
        setRecognizedText("");
        setRetakeCount((prev) => {
            const newCount = [...prev];
            newCount[currentQ] = (newCount[currentQ] || 0) + 1;
            return newCount;
        });
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.own) {
                lastMessage.status = 'retaken';
            }
            return newMessages;
        });
    };

    // Mock evaluation for practice
    const evaluatePracticeResults = () => {
        return {
            overall_score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            feedback: "This was a great practice session! Your responses showed good understanding of sales concepts. Keep practicing to improve your delivery and confidence.",
            strengths: ["Good structure in responses", "Shows relevant experience", "Clear communication"],
            areas_for_improvement: ["Could provide more specific examples", "Work on response timing", "Practice more concise answers"]
        };
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Audio Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
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
                            <h3 className="text-xl font-semibold text-primary">Processing Practice Session...</h3>
                            <p className="text-muted-foreground">Please wait while we process your practice recording</p>
                            <div className="w-full max-w-xs">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    {uploadProgress}% processed
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submission State Modal */}
            <AnimatePresence>
                {((isSubmitting || submissionSuccess || loading) && !isListening && !showUploadModal) && (
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
                                        {showResults ? "Evaluating Practice Session..." : "Loading Question..."}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {showResults
                                            ? "Please wait while we evaluate your practice session"
                                            : `Please wait while we prepare ${questionsRef.current && questionsRef.current.length > 0 ? `the next question` : `the practice session`}`}
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
                                        Practice Session Complete!
                                    </motion.h3>
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex flex-row items-center gap-2 text-accent-foreground bg-slate-400 px-4 py-2 rounded-md hover:bg-slate-500 cursor-pointer"
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
                    <div className="font-bold text-lg text-indigo-600 tracking-tight">Practice Interview</div>
                    <div className="text-xs text-muted-foreground">Mock Interview Session</div>
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
                    <div className="flex-1 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <Card className="w-full max-w-2xl p-8">
                                <div className="text-center mb-8">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <FaCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Session Complete!</h1>
                                    <p className="text-gray-600">Here's your practice evaluation:</p>
                                </div>

                                {(() => {
                                    const evaluation = evaluatePracticeResults();
                                    return (
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="bg-blue-50 rounded-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Score</h3>
                                                    <div className="text-4xl font-bold text-blue-600 mb-2">{evaluation.overall_score}%</div>
                                                    <p className="text-sm text-gray-600">Great job on your practice session!</p>
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback</h3>
                                                    <p className="text-gray-700">{evaluation.feedback}</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="bg-yellow-50 rounded-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Strengths</h3>
                                                    <ul className="space-y-2">
                                                        {evaluation.strengths.map((strength, index) => (
                                                            <li key={index} className="flex items-center text-gray-700">
                                                                <FaCheck className="w-4 h-4 text-green-600 mr-2" />
                                                                {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-orange-50 rounded-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                                                    <ul className="space-y-2">
                                                        {evaluation.areas_for_improvement.map((area, index) => (
                                                            <li key={index} className="flex items-center text-gray-700">
                                                                <FaRedo className="w-4 h-4 text-orange-600 mr-2" />
                                                                {area}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                                <Button
                                                    onClick={() => router.push('/resume')}
                                                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    Start Real Interview
                                                </Button>
                                                <Button
                                                    onClick={() => window.location.reload()}
                                                    variant="outline"
                                                    className="h-12 px-8"
                                                >
                                                    Practice Again
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
                        <div className="h-full flex flex-col sm:flex-row">

                            {/* Question Progress */}
                            {started ? (
                                <div className="w-full sm:w-56 m-4 flex-grow-0 border-1 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 p-5 shadow-inner overflow-y-auto">
                                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Answers</h3>
                                    <div className="space-y-3 gap-4">
                                        {questions.map((q, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 text-sm transition-all ${i === currentQ
                                                    ? "text-indigo-600 font-semibold"
                                                    : i < currentQ && qaPairs[i]?.answer?.trim()
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {i < currentQ && qaPairs[i]?.answer?.trim() ? (
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
                                        title="Ready to Practice?"
                                        description="Click the button below to start your practice interaction session"
                                        buttonText="Start Practice"
                                    />
                                </div>
                            )}

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                <AnimatePresence>
                                    {messages.map((msg, i) => (
                                        !msg.own &&
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
                    <></>
                ) : !showResults && (
                    <div className="flex flex-col items-center gap-6 w-full">
                        <div className="flex flex-wrap justify-center gap-4">
                            {(!recognizedText || isListening || recognizing) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={handleMic}
                                                className={`w-36 h-12 flex items-center justify-center rounded-xl text-base transition-colors shadow-sm ${recognizing ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-primary text-white hover:bg-primary/90"}`}
                                                disabled={isSpeaking || (!micEnabled && !recognizing)}
                                            >
                                                {recognizing ? "Stop" : "Answer"}
                                                {recognizing &&
                                                    <div className="relative flex items-center justify-center m-2">
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-t-0 border-gray-200 rounded-full animate-spin" />
                                                        <FaMicrophone className="" />
                                                    </div>
                                                }
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {recognizing ? "Click to stop recording" : "Click to start recording"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {recognizedText && !recognizing && (
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