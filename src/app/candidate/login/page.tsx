"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { candidateLogin, isCandidateAccessTokenValid, applyJob } from "@/lib/candidateService";
import { useRouter, useSearchParams } from "next/navigation";
import { getRedirectUrl, clearRedirectUrl, getJobIdFromUrl, getStoredJobId, clearStoredJobId } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ScooterHeader from "@/components/ScooterHeader";
import BottomQuote from "@/components/candidate/BottomQuote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isValidEmail } from "@/lib/formValidation";

// Zod validation schema
const loginSchema = z.object({
    email: z.string().min(1, "Email is required").refine(isValidEmail, "Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CandidateLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get jobId from URL or localStorage for use in signup link
    const jobIdFromUrl = getJobIdFromUrl(searchParams);
    const jobIdFromStorage = getStoredJobId();
    const jobId = jobIdFromUrl || jobIdFromStorage;

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        },
        mode: "onChange"
    });

    // Check if all required fields are filled and valid
    const isFormValid = form.formState.isValid;

    React.useEffect(() => {
        if (isCandidateAccessTokenValid()) {
            // Check if there's a redirect URL stored
            const redirectUrl = getRedirectUrl();
            if (redirectUrl) {
                clearRedirectUrl();
                router.replace(redirectUrl);
            } else {
                router.replace("/candidate/dashboard");
            }
        }
    }, []);

    const onSubmit = async (data: LoginFormData) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await candidateLogin({
                email: data.email.trim(),
                password: data.password
            });
            if (res?.status) {
                // Use the jobId from component scope

                if (jobId) {
                    try {
                        // Apply for the job
                        const applyRes = await applyJob({ job_id: jobId });
                        if (applyRes?.status && applyRes?.applied) {
                            // New application submitted successfully - clear jobId
                            if (jobIdFromStorage) {
                                clearStoredJobId();
                            }
                            toast({
                                title: "Application Submitted",
                                description: "Your application has been submitted successfully!",
                                variant: "default"
                            });
                            router.push("/candidate/dashboard");
                        } else if (!applyRes?.status && applyRes?.applied) {
                            // User has already applied to this job - clear jobId
                            if (jobIdFromStorage) {
                                clearStoredJobId();
                            }
                            toast({
                                title: "Already Applied",
                                description: "You have already applied to this job.",
                                variant: "default"
                            });
                            router.push(`/candidate/dashboard?job_id=${encodeURIComponent(jobId)}`);
                        } else {
                            // Application failed for other reasons - don't clear jobId
                            toast({
                                title: "Application Failed",
                                description: applyRes?.message || "Failed to apply for job",
                                variant: "destructive"
                            });
                            router.push("/candidate/dashboard");
                        }
                    } catch (applyError: any) {
                        console.log('Apply error caught:', applyError);
                        const responseData = applyError?.response?.data;

                        // Check if this is an "already applied" error (400 with specific response)
                        if (responseData && responseData.status === false && responseData.applied === true) {
                            // This is an "already applied" case, handle it properly
                            if (jobIdFromStorage) {
                                clearStoredJobId();
                            }
                            toast({
                                title: "Already Applied",
                                description: "You have already applied to this job.",
                                variant: "default"
                            });
                            router.push(`/candidate/dashboard?job_id=${encodeURIComponent(jobId)}`);
                        } else {
                            // This is a genuine error
                            const applyMsg = responseData?.message || applyError?.message || 'Failed to apply for job';
                            toast({
                                title: "Application Failed",
                                description: applyMsg,
                                variant: "destructive"
                            });
                            router.push("/candidate/dashboard");
                        }
                    }
                } else {
                    // No jobId, check for redirect URL or go to dashboard
                    const redirectUrl = getRedirectUrl();
                    if (redirectUrl) {
                        clearRedirectUrl();
                        router.push(redirectUrl);
                    } else {
                        router.push("/candidate/dashboard");
                    }
                }
                return;
            }
            // Handle error response with message or detail field
            const errorMessage = res?.message || (res as any)?.detail || "Login failed";
            setError(errorMessage);
        } catch (err: any) {
            // Handle catch block errors - check if it's an axios error with response data
            let errorMessage = "An unexpected error occurred. Please try again.";

            if (err?.response?.data) {
                const responseData = err.response.data;
                errorMessage = responseData.message || responseData.detail || errorMessage;
            } else if (err?.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error("Login error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">

            {/* Main Content */}
            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl  p-6 sm:p-10">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold italic">Welcome back!</h2>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="ex: johndoe@gmail.com"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        ) : (
                                                            <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-center">
                                    <Button type="submit" disabled={!isFormValid || submitting} className="w-fit" variant="primary">
                                        {submitting ? "Logging in..." : "Login"}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <Link href="/candidate/reset-password" className="text-sm text-element-2 hover:text-amber-700 underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </form>
                        </Form>

                        <div className="my-8 border-t" />

                        <div className="flex flex-col items-center justify-center gap-3 space-y-3">
                            <p className="font-bold">New to Scooter?</p>
                            <Link href={`/candidate/signup${jobId ? `?job_id=${encodeURIComponent(jobId)}` : ''}`}>
                                <Button variant="primary">Sign Up with Email Address</Button>
                            </Link>
                            <Button variant="primary">Sign Up with Google Account</Button>
                        </div>

                        <div className="mt-12">
                            <BottomQuote quote="Simple steps today, big opportunities tomorrow. 🏅" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
