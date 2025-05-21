"use client"

import { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaUser, FaUserTie } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoadingDots } from "@/components/ui/loadingDots";
import { generateInterviewQuestions, evaluateInterview, QAPair, EvaluateInterviewResponse } from "@/lib/interviewService";
import { textInAudioOut } from "@/lib/voiceBot";
import Penguine from "@/../public/assets/icons/penguin_2273664.png";
import Image from "next/image";

const POSTING_TITLE = "Senior Sales Executive";
const WORK_EXPERIENCE = "5+ years";

// Azure Speech Services configuration
const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY;
const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION;

export default function VoiceInterviewPage() {
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const questionsRef = useRef<string[]>([]); // Add ref to track questions
    const [currentQ, setCurrentQ] = useState(0);
    const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
    const [messages, setMessages] = useState<{ own: boolean; text: string; icon: React.ReactNode }[]>([]);
    const [micEnabled, setMicEnabled] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [evaluation, setEvaluation] = useState<EvaluateInterviewResponse | null>(null);
    const [recognizedText, setRecognizedText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        try {
            const res = await generateInterviewQuestions({
                posting_title: POSTING_TITLE,
                work_experience: WORK_EXPERIENCE,
                profile_id: profile_id
            });
            console.log("Generated questions response:", res);

            if (!res.questions || res.questions.length === 0) {
                throw new Error("No questions were generated");
            }

            // Reset all states first
            setStarted(false);
            setCurrentQ(0);
            setQaPairs([]);
            setMessages([]);
            setShowResults(false);

            // Set questions in both state and ref
            setQuestions(res.questions);
            questionsRef.current = res.questions;
            console.log("Questions set in state and ref:", res.questions);

            // Now start the interview
            setStarted(true);

            // Start with the first question
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
        console.log("askQuestion called with index:", index);

        // Use the ref to get current questions
        const currentQuestions = questionsRef.current;
        console.log("Current questions from ref:", currentQuestions);

        if (!currentQuestions || currentQuestions.length === 0) {
            console.error("No questions available in askQuestion");
            setError("No questions available. Please try again.");
            return;
        }

        if (index >= currentQuestions.length) {
            console.log("Index out of bounds:", index, "questions length:", currentQuestions.length);
            return;
        }

        setMicEnabled(false);
        setLoading(true);
        const question = currentQuestions[index];
        console.log("Processing question at index", index, ":", question);

        try {
            // Add question to chat first
            setMessages((prev) => [...prev, {
                own: false,
                text: question,
                icon: <FaUserTie className="text-primary w-6 h-6" />
            }]);

            // Speak the question using TTS
            await textInAudioOut(
                question,
                (spokenText) => {
                    console.log("TTS spoken text:", spokenText);
                    // Update the message with the actual spoken text if needed
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

            // Enable mic for user's response after TTS is done
            setMicEnabled(true);
            setLoading(false);
        } catch (error) {
            console.error("Error in askQuestion:", error);
            setError("Failed to ask question. Please try again.");
            setLoading(false);
        }
    };

    // Handle user's answer (STT)
    const handleMic = async () => {
        if (!SPEECH_KEY || !SPEECH_REGION) {
            setError("Azure Speech Services configuration is missing");
            return;
        }

        setIsListening(true);
        setRecognizedText("");
        setLoading(true);

        try {
            // Import the Speech SDK
            const speechsdk = await import("microsoft-cognitiveservices-speech-sdk");

            // Configure speech service
            const speechConfig = speechsdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
            speechConfig.speechRecognitionLanguage = "en-US";

            // Configure audio input
            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

            // Create speech recognizer
            const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

            // Set up event handlers
            recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    const answer = e.result.text;
                    console.log("Recognized answer:", answer);
                    setRecognizedText(answer);

                    // Add answer to chat
                    setMessages((prev) => [...prev, {
                        own: true,
                        text: answer,
                        icon: <FaUser className="text-secondary w-6 h-6" />
                    }]);

                    // Add to Q&A pairs using ref for current question
                    setQaPairs((prev) => {
                        const newPairs = [...prev, {
                            question: questionsRef.current[currentQ],
                            answer: answer
                        }];
                        console.log("Updated Q&A pairs:", newPairs);
                        return newPairs;
                    });

                    // Stop recognition
                    recognizer.stopContinuousRecognitionAsync(
                        () => {
                            setIsListening(false);
                            setLoading(false);

                            // Move to next question or evaluate
                            if (currentQ < questionsRef.current.length - 1) {
                                const nextQ = currentQ + 1;
                                setCurrentQ(nextQ);
                                // Use setTimeout to ensure state updates before asking next question
                                setTimeout(() => askQuestion(nextQ), 1000);
                            } else {
                                // For the last question, wait a bit to ensure state is updated
                                setTimeout(() => {
                                    console.log("Final Q&A pairs before evaluation:", qaPairs);
                                    evaluateInterviewResults();
                                }, 500);
                            }
                        },
                        (err) => {
                            console.error("Error stopping recognition:", err);
                            setIsListening(false);
                            setLoading(false);
                        }
                    );
                }
            };

            recognizer.canceled = (s, e) => {
                console.log("Speech recognition canceled:", e);
                setIsListening(false);
                setLoading(false);
                if (e.reason === speechsdk.CancellationReason.Error) {
                    setError(`Speech recognition error: ${e.errorDetails}`);
                }
            };

            // Start recognition
            recognizer.startContinuousRecognitionAsync(
                () => {
                    console.log("Recognition started");
                },
                (err) => {
                    console.error("Error starting recognition:", err);
                    setError("Failed to start speech recognition");
                    setIsListening(false);
                    setLoading(false);
                }
            );

        } catch (err: any) {
            console.error("Speech recognition error:", err);
            setError(err.message || "Speech recognition failed");
            setIsListening(false);
            setLoading(false);
        }
    };

    // Separate function for evaluating interview results
    const evaluateInterviewResults = async () => {
        const profile_id = localStorage.getItem('profile_id');
        if (!profile_id) {
            setError("No profile ID found");
            setLoading(false);
            return;
        }

        // Get the latest Q&A pairs
        const currentQAPairs = [...qaPairs];
        console.log("Evaluating interview results", {
            qaPairs: currentQAPairs,
            user_id: profile_id,
            profile_id: profile_id
        });

        setLoading(true);
        try {
            const evalRes = await evaluateInterview({
                qa_pairs: currentQAPairs,
                user_id: profile_id,
            });
            setEvaluation(evalRes);
            setShowResults(true);
        } catch (err: any) {
            setError(err.message || "Failed to evaluate interview");
        } finally {
            setLoading(false);
        }
    };

    // Render analytics/results
    const renderResults = () => {
        if (!evaluation) return null;
        const { interview_summary, qa_evaluations } = evaluation;
        return (
            <Card className="w-full max-w-2xl mx-auto mt-8 p-6">
                <h2 className="text-2xl font-bold mb-4 text-primary">Interview Results</h2>
                <div className="mb-4 flex flex-wrap gap-4">
                    <Badge className="bg-green-100 text-green-800">Avg. Score: {interview_summary.average_score.toFixed(2)}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Total Questions: {interview_summary.total_questions}</Badge>
                </div>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Dimension Averages</h3>
                    {Object.entries(interview_summary.dimension_averages).map(([dim, val]) => (
                        <div key={dim} className="mb-2">
                            <span className="capitalize font-medium">{dim.replace("_", " ")}: </span>
                            <Progress value={val * 20} className="w-1/2 inline-block align-middle mx-2" />
                            <span className="ml-2 font-semibold">{val.toFixed(2)}/5</span>
                        </div>
                    ))}
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Strengths</h3>
                    <ul className="list-disc ml-6">
                        {interview_summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                    <ul className="list-disc ml-6">
                        {interview_summary.areas_for_improvement.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Q&A Evaluations</h3>
                    {qa_evaluations.map((qa, i) => (
                        <Card key={i} className="mb-2 p-2 bg-muted">
                            <div className="font-semibold">Q{i + 1}: {qa.question}</div>
                            <div className="mb-1">A: {qa.answer}</div>
                            <div className="text-sm text-muted-foreground">{qa.evaluation.summary}</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(qa.evaluation).filter(([k]) => k !== "summary" && k !== "overall_score").map(([k, v]: any) => (
                                    <Badge key={k} className="bg-primary/10 text-primary font-medium">{k}: {v.score}/5</Badge>
                                ))}
                                <Badge className="bg-green-100 text-green-800">Overall: {qa.evaluation.overall_score}/5</Badge>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="mb-2 text-center">
                    <Button onClick={() => window.location.reload()} className="mt-2">Restart Interview</Button>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-8 px-2">
            <Card className="w-full max-w-2xl mx-auto shadow-lg p-0">
                <div className="flex items-center gap-4 p-4 border-b bg-white/80">
                    <Image src={Penguine} alt="Bot" className="h-12 w-12 rounded-full" />
                    <div>
                        <div className="font-bold text-lg text-primary">AI Interviewer</div>
                        <div className="text-xs text-muted-foreground">Voice Interview Simulation</div>
                    </div>
                </div>
                <div className="h-[60vh] overflow-y-auto p-4 bg-background">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-2 mb-3 ${msg.own ? "justify-end" : "justify-start"}`}>
                            <div className="flex-shrink-0">{msg.icon}</div>
                            <div className={`rounded-xl px-4 py-2 ${msg.own ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{msg.text}</div>
                        </div>
                    ))}
                    {loading && <LoadingDots bg="#e0e7ff" logo={Penguine} />}
                    <div ref={scrollRef} />
                </div>
                {!started && (
                    <div className="p-4 flex justify-center">
                        <Button onClick={handleStart} className="w-full max-w-xs">Continue to Interview</Button>
                    </div>
                )}
                {started && !showResults && (
                    <div className="p-4 flex flex-col items-center">
                        <Button onClick={handleMic} className="w-32 h-12 flex items-center justify-center" disabled={!micEnabled || loading || isListening}>
                            <FaMicrophone className="mr-2" /> {isListening ? "Listening..." : "Answer"}
                        </Button>
                        {recognizedText && <div className="mt-2 text-sm text-muted-foreground">Recognized: {recognizedText}</div>}
                    </div>
                )}
                {error && <div className="text-red-600 text-center p-2">{error}</div>}
            </Card>
            {showResults && renderResults()}
        </div>
    );
}

