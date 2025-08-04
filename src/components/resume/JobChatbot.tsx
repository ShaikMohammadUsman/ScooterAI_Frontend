"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Loader2, X, HelpCircle, Sparkles, Zap } from "lucide-react";
import { askJobQuestion, ChatbotRequest } from "@/lib/resumeService";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface JobChatbotProps {
    jobId: string;
    jobTitle?: string;
}

const SUGGESTED_QUESTIONS = [
    "What are the qualifications required?",
    "What is the salary range?",
    "What are the key responsibilities?",
    "What skills are needed?",
    "What is the work location?",
    "What is the notice period requirement?"
];

export default function JobChatbot({ jobId, jobTitle }: JobChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: `Hi! I'm here to help you with questions about the ${jobTitle || "job"} position. What would you like to know?`,
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: message,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const request: ChatbotRequest = {
                question: message,
                job_id: jobId
            };

            const response = await askJobQuestion(request);

            if (response.status) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: response.answer,
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error("Failed to get response");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to get answer from chatbot",
                variant: "destructive"
            });

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I couldn't process your question right now. Please try again later.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        handleSendMessage(question);
    };



    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="relative">
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>

                        <Button
                            onClick={() => setIsOpen(true)}
                            className="relative rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-2 border-white/20 backdrop-blur-sm"
                            size="icon"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                                    <Image
                                        src="/assets/images/scooterLogo.png"
                                        alt="Scooter AI"
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <MessageCircle className="w-2 h-2 text-white" />
                                </div>
                            </div>
                        </Button>

                        {/* Floating question mark */}
                        <div className="absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-lg border border-gray-200">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
                    <div className="bg-black/20 absolute inset-0" onClick={() => setIsOpen(false)} />
                    <Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl border-0 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>

                        {/* Header */}
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                                            <Image
                                                src="/assets/images/scooterLogo.png"
                                                alt="Scooter AI"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-300" />
                                            Job Assistant
                                        </CardTitle>
                                        <p className="text-xs text-blue-100">Ask me anything about the position</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        {/* Messages */}
                        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 relative scrollbar-thin">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 relative ${message.isUser
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                                : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                                                }`}
                                        >
                                            {!message.isUser && (
                                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                    <Image
                                                        src="/assets/images/scooterLogo.png"
                                                        alt="Scooter AI"
                                                        width={16}
                                                        height={16}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative">
                                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                <Image
                                                    src="/assets/images/scooterLogo.png"
                                                    alt="Scooter AI"
                                                    width={16}
                                                    height={16}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Suggested Questions */}
                            {messages.length === 1 && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs text-gray-500 font-medium">Quick questions:</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_QUESTIONS.map((question, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs transition-colors"
                                                onClick={() => handleSuggestedQuestion(question)}
                                            >
                                                {question}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                            <div className="flex flex-col gap-2">
                                <Textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(inputValue);
                                        }
                                    }}
                                    placeholder="Ask about the job..."
                                    className="w-full min-h-[60px] max-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                    disabled={isLoading}
                                    rows={2}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => handleSendMessage(inputValue)}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-4 py-2"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
} 