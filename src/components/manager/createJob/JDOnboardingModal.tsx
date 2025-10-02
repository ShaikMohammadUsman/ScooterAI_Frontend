"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ScooterHeader from "@/components/ScooterHeader";
import { Textarea } from "@/components/ui/textarea";
import { generateJobDescription, GeneratedJobDescriptionResponse } from "@/lib/managerService";
import { UseFormReturn } from "react-hook-form";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { Progress } from "@/components/ui/progress";
import { Mic, X as IconX, ArrowUp } from "lucide-react";
import Link from "next/link";
import useResponsiveBarCount from "@/hooks/useBarCounts";

interface JDOnboardingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<any>;
    onChooseManual: () => void;
}

const ListeningBars: React.FC = () => {
    const barCount = useResponsiveBarCount();
    const bars = useMemo(() => Array.from({ length: barCount }), [barCount]);
    return (
        <div className="h-10 px-3 rounded-full flex items-end justify-center gap-[3px]">
            {bars.map((_, i) => (
                <span
                    key={i}
                    className="w-[3px] rounded-sm"
                    style={{
                        height: `${8 + ((i * 37) % 24)}px`,
                        background: `linear-gradient(180deg, var(--color-grad-1), var(--color-grad-2))`,
                        animation: `sbars 1.2s ease-in-out ${i * 0.04}s infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes sbars {
                    0%, 100% { transform: scaleY(0.4); opacity: 0.85; }
                    50% { transform: scaleY(1.35); opacity: 1; }
                }
            `}</style>
        </div>
    );
};


export default function JDOnboardingModal({ open, onOpenChange, form, onChooseManual }: JDOnboardingModalProps) {
    const [mode, setMode] = useState<'cards' | 'voice' | 'loading'>('cards');
    const [stableTranscript, setStableTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const recognizerRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_API_KEY as string | undefined;
    const SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_REGION as string | undefined;

    useEffect(() => {
        let id: any;
        if (submitting) {
            setProgress(6);
            id = setInterval(() => setProgress((p) => (p && p < 96 ? p + 5 : p)), 400);
        } else {
            setProgress(null);
            if (id) clearInterval(id);
        }
        return () => id && clearInterval(id);
    }, [submitting]);

    // Cleanup Azure Speech-to-Text when dialog closes or component unmounts
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (recognizerRef.current) {
                try {
                    recognizerRef.current.stopContinuousRecognitionAsync?.();
                } catch (e) {
                    console.warn('Error stopping speech recognition on unmount:', e);
                }
                recognizerRef.current = null;
            }
        };
    }, []);

    // Cleanup when dialog closes
    useEffect(() => {
        if (!open && recognizerRef.current) {
            try {
                recognizerRef.current.stopContinuousRecognitionAsync?.();
            } catch (e) {
                console.warn('Error stopping speech recognition on dialog close:', e);
            }
            recognizerRef.current = null;
            setListening(false);
            setStableTranscript("");
            setInterimTranscript("");
        }
    }, [open]);

    // Keep caret and scroll at end when transcript updates
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        const moveToEnd = () => {
            el.selectionStart = el.value.length;
            el.selectionEnd = el.value.length;
            el.scrollTop = el.scrollHeight;
        };
        // Defer to next frame to ensure DOM has updated value
        requestAnimationFrame(moveToEnd);
    }, [stableTranscript, interimTranscript]);

    const startListening = async () => {
        if (!SPEECH_KEY || !SPEECH_REGION) {
            setStableTranscript((t) => t || "Speech setup missing. Please type your requirements.");
            return;
        }
        setListening(true);
        setStableTranscript("");
        setInterimTranscript("");
        try {
            const speechConfig = speechsdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
            speechConfig.speechRecognitionLanguage = "en-IN";
            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
            recognizerRef.current = recognizer;
            recognizer.recognizing = (_s, e) => {
                if (e.result?.text) setInterimTranscript(e.result.text);
            };
            recognizer.recognized = (_s, e) => {
                if (e.result?.text) setStableTranscript((prev) => (prev ? `${prev} ${e.result.text}` : e.result.text));
                setInterimTranscript("");
            };
            recognizer.canceled = () => setListening(false);
            recognizer.sessionStopped = () => setListening(false);
            await recognizer.startContinuousRecognitionAsync();
        } catch (e) {
            setListening(false);
        }
    };

    const cancelVoice = () => {
        setListening(false);
        setStableTranscript("");
        setInterimTranscript("");
        try {
            recognizerRef.current?.stopContinuousRecognitionAsync?.();
        } catch (e) {
            console.warn('Error stopping speech recognition on cancel:', e);
        }
        recognizerRef.current = null;
        setMode('cards');
    };

    const submitVoice = async () => {
        const transcript = `${stableTranscript}${interimTranscript ? ' ' + interimTranscript : ''}`.trim();
        if (!transcript) return;
        setSubmitting(true);
        try {
            const res = (await generateJobDescription({ prompt: transcript })) as GeneratedJobDescriptionResponse;
            const jd = (res as any)?.job_description || (res as any)?.jobDescription || (res as any)?.data?.job_description;
            if (jd) {
                // Prefill form
                const { basicInfo, experienceSkills, compensations } = jd;
                if (basicInfo) {
                    if (basicInfo.companyName) form.setValue("companyName", basicInfo.companyName);
                    if (basicInfo.jobTitle) form.setValue("jobTitle", basicInfo.jobTitle);
                    if (basicInfo.roleType) form.setValue("roleType", basicInfo.roleType);
                    if (basicInfo.primaryFocus && Array.isArray(basicInfo.primaryFocus) && basicInfo.primaryFocus[0]) form.setValue("primaryFocus", basicInfo.primaryFocus[0]);
                    if (basicInfo.salesProcessStages) form.setValue("salesProcessStages", basicInfo.salesProcessStages);
                }
                if (experienceSkills) {
                    if (experienceSkills.minExp != null && experienceSkills.maxExp != null) form.setValue("yearsOfExperience", `${experienceSkills.minExp}-${experienceSkills.maxExp}`);
                    if (experienceSkills.skillsRequired) form.setValue("mustHaveSkills", experienceSkills.skillsRequired);
                    if (experienceSkills.workLocation) form.setValue("workLocationType", experienceSkills.workLocation);
                    if (experienceSkills.location && Array.isArray(experienceSkills.location) && experienceSkills.location[0]) form.setValue("location", experienceSkills.location[0]);
                    if (experienceSkills.timeZone && experienceSkills.timeZone[0]) form.setValue("timezone", experienceSkills.timeZone[0]);
                }
                if (compensations) {
                    if (compensations.baseSalary) {
                        if (compensations.baseSalary.currency) form.setValue("currency", compensations.baseSalary.currency === "USD" ? "$" : compensations.baseSalary.currency);
                        if (compensations.baseSalary.minSalary) form.setValue("salaryFrom", String(compensations.baseSalary.minSalary));
                        if (compensations.baseSalary.maxSalary) form.setValue("salaryTo", String(compensations.baseSalary.maxSalary));
                    }
                    if (Array.isArray(compensations.ote)) form.setValue("oteStructure", compensations.ote.join(", "));
                    if (Array.isArray(compensations.opportunities)) form.setValue("opportunityHighlights", compensations.opportunities);
                    if (Array.isArray(compensations.keyChallenged)) form.setValue("challenges", compensations.keyChallenged);
                    if (Array.isArray(compensations.laguages)) form.setValue("languages", compensations.laguages);
                }
            }
            setMode('cards');
            onOpenChange(false);
        } finally {
            setSubmitting(false);
            // Cleanup speech recognition after successful submission
            if (recognizerRef.current) {
                try {
                    recognizerRef.current.stopContinuousRecognitionAsync?.();
                } catch (e) {
                    console.warn('Error stopping speech recognition after submit:', e);
                }
                recognizerRef.current = null;
            }
            setListening(false);
            setStableTranscript("");
            setInterimTranscript("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 !max-w-none !w-screen !h-screen rounded-none !fixed !inset-0 !translate-x-0 !translate-y-0 !m-0 !left-0 !top-0 !right-0 !bottom-0">
                <DialogTitle className="sr-only">Job Description Creation Options</DialogTitle>
                <div className="h-full flex flex-col">
                    <div className="border-b">
                        <ScooterHeader />
                    </div>
                    <div className="h-full flex flex-1 justify-center items-center overflow-auto">
                        <div className="">
                            {mode === 'cards' && (
                                <div className="max-w-5xl mx-auto px-4 py-10">
                                    <h2 className="text-center text-xl sm:text-2xl font-semibold">How Would You Like To Create Your JD ?</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                        <div className="flex flex-col justify-around items-center rounded-xl border bg-white p-6 shadow-sm">
                                            <h3 className="font-semibold mb-2">Just Tell Us What You Need</h3>
                                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                                <li>Speak your requirements</li>
                                                <li>We transcribe & pre-fill the form</li>
                                                <li>Edit before submitting</li>
                                            </ul>
                                            <Button variant="primary" className="mt-4" onClick={() => { setMode('voice'); }}>Create Now</Button>
                                        </div>
                                        <div className="flex flex-col justify-around items-center rounded-xl border bg-white p-6 shadow-sm">
                                            <h3 className="font-semibold mb-2">I'm a Traditionalist</h3>
                                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                                <li>Fill out the form yourself</li>
                                                <li>Full control, step by step</li>
                                            </ul>
                                            <Button variant="primary" className="mt-4" onClick={() => onOpenChange(false)}>Create Now</Button>
                                        </div>
                                        <div className="flex flex-col justify-around items-center rounded-xl border bg-white p-6 shadow-sm">
                                            <h3 className="font-semibold mb-2">I'm Lost ! Help me Figure Out Who To Hire</h3>
                                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                                <li>Get guidance from our team</li>
                                                <li>Quick call to align on needs</li>
                                            </ul>
                                            <Link href="/manager/contact-us" rel="noreferrer">
                                                <Button variant="primary" className="mt-4">Contact Us</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {mode === 'voice' && (
                                <div className="max-w-4xl mx-auto px-4 py-10">
                                    <h3 className="text-center text-lg font-semibold">Looking For Amazing Sales Talent?</h3>
                                    <p className="text-center text-sm text-muted-foreground">Tell us your requirements and let us create the perfect JD!</p>
                                    <p className="mt-10 text-center text-sm text-muted-foreground">{listening ? 'Talk to me about the position, job type, location, role budget and non-negotiables, and I’ll create the perfect Job Description.' : 'Type or talk about the position, job type, location, skills, budget, vibes, and non-negotiables!'}</p>

                                    <div className="mt-6 p-4 rounded-2xl shadow-[0_0_32px_-12px_rgba(0,0,0,0.2)] relative" style={{ boxShadow: `0 0 24px -8px var(--color-grad-1), 0 0 24px -8px var(--color-grad-2)` }}>
                                        <Textarea
                                            ref={textareaRef}
                                            rows={6}
                                            className="border-0 shadow-none scrollbar-thin"
                                            value={`${stableTranscript}${interimTranscript ? ' ' + interimTranscript : ''}`}
                                            onChange={(e) => { setStableTranscript(e.target.value); setInterimTranscript(""); }}
                                            placeholder="Example: We're TechCorp hiring a Senior AE in Mumbai..."
                                        />

                                        {/* Mic button overlapping bottom edge center */}
                                        {!listening && (
                                            <button
                                                type="button"
                                                onClick={startListening}
                                                className="absolute left-1/2 translate-x-[-50%] translate-y-1/2 bottom-0 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer"
                                                style={{ background: `linear-gradient(90deg, var(--color-grad-1), var(--color-grad-2))` }}
                                                aria-label="Start recording"
                                            >
                                                <Mic className="h-6 w-6" />
                                            </button>
                                        )}
                                        {listening && (
                                            <div className="absolute left-1/2 translate-x-[-50%] translate-y-1/2 bottom-0 z-10 flex items-center justify-center w-80 sm:w-full mx-auto">
                                                <div className="w-full flex items-center justify-around gap-6">
                                                    <Button variant="secondary" className="h-10 w-10 sm:h-12 sm:w-12 px-2 sm:px-2" onClick={cancelVoice} aria-label="Cancel recording">
                                                        <IconX className="h-6 w-6" />
                                                    </Button>
                                                    <ListeningBars />
                                                    <Button variant="primary" className="h-10 w-10 sm:h-12 sm:w-12 px-2 sm:px-2" onClick={submitVoice} aria-label="Submit">
                                                        <ArrowUp className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            )}
                            {submitting && (
                                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                                    <p className="mb-2 font-medium">Generating The Perfect JD</p>
                                    <Progress
                                        className=""
                                        value={progress || 10}
                                        style={{}}
                                    />
                                    <p className="text-xs text-muted-foreground mt-3">"Crafting words that attract stars, hang tight" ✨</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
