"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { candidateSignup, parseCandidateResume, isCandidateAccessTokenValid } from "@/lib/candidateService";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaUpload, FaGoogleDrive } from "react-icons/fa";
import ScooterHeader from "@/components/ScooterHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isValidEmail, isValidPhoneNumber, handlePhoneInputChange, getPhoneDisplayValue, isValidLinkedInUrl } from "@/lib/formValidation";
import ResumeParsingOverlay from "@/components/candidate/ResumeParsingOverlay";
import { useCandidateProfileStore } from "@/store/candidateProfile";

// Zod validation schema
const signupSchema = z.object({
    name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").refine(isValidEmail, "Please enter a valid email address"),
    phone: z.string().min(1, "Phone number is required").refine(isValidPhoneNumber, "Please enter a valid phone number"),
    candidateSource: z.string().min(1, "Please select how you found Scooter"),
    linkedinProfile: z.string().optional().refine((val) => !val || isValidLinkedInUrl(val), "Please enter a valid LinkedIn URL"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    notifications: z.boolean().default(false)
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function CandidateSignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [showParsingOverlay, setShowParsingOverlay] = useState(false);
    const [parsingProgress, setParsingProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams?.get('job_id') || '';

    const { setParsingData } = useCandidateProfileStore();

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            candidateSource: "",
            linkedinProfile: "",
            password: "",
            notifications: false
        },
        mode: "onChange"
    });

    const password = form.watch("password");

    const passwordRules = {
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
        minLen: password.length >= 8
    };

    // Check if all required fields are filled and valid
    const formValues = form.watch();
    const allFieldsFilled =
        formValues.name?.trim() &&
        formValues.email?.trim() &&
        formValues.phone?.trim() &&
        formValues.candidateSource?.trim() &&
        formValues.password;

    const passwordValid = password &&
        passwordRules.hasUpper &&
        passwordRules.hasLower &&
        passwordRules.hasNumber &&
        passwordRules.hasSpecial &&
        passwordRules.minLen;

    const isFormValid = allFieldsFilled && passwordValid && resumeFile && !form.formState.errors.name && !form.formState.errors.email && !form.formState.errors.phone && !form.formState.errors.candidateSource && !form.formState.errors.password;

    useEffect(() => {
        if (isCandidateAccessTokenValid()) {
            router.replace("/candidate/dashboard");
        }
    }, []);

    // Reset form errors when error state clears
    useEffect(() => {
        if (!error) {
            form.clearErrors();
        }
    }, [error, form]);

    const handlePhoneChange = (value: string) => {
        const formatted = handlePhoneInputChange(value);
        form.setValue("phone", formatted);
    };

    const onSubmit = async (data: SignupFormData) => {
        setSubmitting(true);
        setError(null);
        // Clear any previous form errors
        form.clearErrors();
        try {
            // Step 1: Call signup API
            const signupRes = await candidateSignup({
                name: data.name.trim(),
                email: data.email.trim(),
                password: data.password,
                phone: data.phone.trim(),
                canidate_source: data.candidateSource.trim(),
                linkedin_profile: data.linkedinProfile?.trim() || ""
            });

            if (!signupRes?.status) {
                // Handle error response with message or detail field
                const errorMessage = signupRes?.message || (signupRes as any)?.detail || "Signup failed";
                setError(errorMessage);
                return;
            }

            // Start parsing overlay immediately after successful signup
            setShowParsingOverlay(true);
            setParsingProgress(0);

            // Simulate gradual progress
            const simulateProgress = () => {
                const interval = setInterval(() => {
                    setParsingProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(interval);
                            return 90;
                        }
                        return prev + Math.random() * 10;
                    });
                }, 200);
                return interval;
            };

            const progressInterval = simulateProgress();

            // Step 2: Always call parse resume API since resume file is required
            try {
                const parseRes = await parseCandidateResume({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    file: resumeFile!
                });

                clearInterval(progressInterval);
                setParsingProgress(100);

                // Store parsed data in global state
                if (parseRes?.data) {
                    setParsingData(parseRes.data);
                    setTimeout(() => {
                        const next = jobId ? `/candidate/profile?job_id=${encodeURIComponent(jobId)}` : "/candidate/profile";
                        router.push(next);
                    }, 1500);
                } else {
                    throw new Error("No parsed data received");
                }
            } catch (parseError: any) {
                clearInterval(progressInterval);
                console.error("Resume parsing failed:", parseError);
                // Handle resume parsing error
                let errorMessage = "Resume parsing failed. Redirecting to dashboard.";

                if (parseError?.response?.data) {
                    const responseData = parseError.response.data;
                    errorMessage = responseData.message || responseData.detail || errorMessage;
                } else if (parseError?.message) {
                    errorMessage = parseError.message;
                }

                setShowParsingOverlay(false);
                setError(errorMessage);
                // Still redirect to dashboard even if resume parsing fails
                setTimeout(() => {
                    router.push("/candidate/dashboard");
                }, 3000); // Give user time to see the error
                return;
            }
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
            console.error("Signup error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const handleUploadFromDevice = () => {
        fileInputRef.current?.click();
    };

    const handleUploadFromDrive = () => {
        // TODO: Implement Google Drive integration
        console.log("Upload from Google Drive");
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-main)' }}>

            {/* Main Content */}
            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl p-6 sm:p-10" style={{ background: 'var(--color-card)' }}>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold italic">Unlock your dream sales job</h2>
                            <p className="text-sm text-gray-500">Simple steps today, big opportunities tomorrow.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="ex: John Doe"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address*</FormLabel>
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
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="tel"
                                                    value={getPhoneDisplayValue(field.value)}
                                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                                    placeholder="ex: 9876543210"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="candidateSource"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>How did you find Scooter?*</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select the source....." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Indeed">Indeed</SelectItem>
                                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                                        <SelectItem value="Naukri">Naukri</SelectItem>
                                                        <SelectItem value="Rev Genius">Rev Genius</SelectItem>
                                                        <SelectItem value="Whatsapp Groups">Whatsapp Groups</SelectItem>
                                                        <SelectItem value="Website">Website</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="linkedinProfile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Linkedin Profile</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="url"
                                                    placeholder="https://linkedin.com/in/johndoe"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Resume Upload Section */}
                                <div>
                                    <Label>Upload Resume*</Label>
                                    <div className="mt-2 flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleUploadFromDevice}
                                            variant="outline"
                                            className="flex-1 rounded-full border-2 border-cta-primary text-cta-primary hover:bg-cta-primary hover:border-cta-primary hover:text-cta-primary-text"
                                        >
                                            <FaUpload className="mr-2" />
                                            Upload From Device
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleUploadFromDrive}
                                            variant="outline"
                                            className="flex-1 rounded-full border-2 border-cta-primary text-cta-primary hover:bg-cta-primary hover:border-cta-primary hover:text-cta-primary-text"
                                        >
                                            <FaGoogleDrive className="mr-2" />
                                            Upload From Drive
                                        </Button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {resumeFile ? (
                                        <p className="mt-2 text-sm text-green-600">✓ {resumeFile.name} selected</p>
                                    ) : (
                                        <p className="mt-2 text-sm text-red-500">⚠ Resume file is required</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password*</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        onFocus={() => setPasswordFocused(true)}
                                                        onBlur={() => setPasswordFocused(false)}
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
                                            {passwordFocused && (
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <div className={`flex items-center gap-2 ${passwordRules.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`h-3 w-3 rounded-full border ${passwordRules.hasUpper ? 'bg-green-600 border-green-600' : 'border-gray-400'}`} />
                                                        At least one uppercase letter
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordRules.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`h-3 w-3 rounded-full border ${passwordRules.hasLower ? 'bg-green-600 border-green-600' : 'border-gray-400'}`} />
                                                        At least one lowercase letter
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordRules.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`h-3 w-3 rounded-full border ${passwordRules.hasNumber ? 'bg-green-600 border-green-600' : 'border-gray-400'}`} />
                                                        At least one number
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordRules.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`h-3 w-3 rounded-full border ${passwordRules.hasSpecial ? 'bg-green-600 border-green-600' : 'border-gray-400'}`} />
                                                        At least one special character
                                                    </div>
                                                    <div className={`flex items-center gap-2 ${passwordRules.minLen ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`h-3 w-3 rounded-full border ${passwordRules.minLen ? 'bg-green-600 border-green-600' : 'border-gray-400'}`} />
                                                        Minimum 8 characters
                                                    </div>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Notifications Checkbox */}
                                <FormField
                                    control={form.control}
                                    name="notifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm text-gray-600 leading-relaxed">
                                                    Receive Email and WhatsApp notifications about your application or relevant opportunities only
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-center">
                                    <Button type="submit" disabled={!isFormValid || submitting} className="w-fit mx-auto" variant="primary">
                                        {submitting ? "Creating Account..." : "Proceed"}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <div className="my-8 border-t" />

                        <div className="text-center space-y-3">
                            <p className="font-semibold">Already Registered? Login Here</p>
                            <Link href="/candidate/login">
                                <Button variant="primary">Login</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Parsing Overlay */}
            <ResumeParsingOverlay
                isVisible={showParsingOverlay}
                progress={parsingProgress}
                onComplete={(data) => {
                    console.log("Parsing completed:", data);
                }}
                onError={(error) => {
                    console.error("Parsing error:", error);
                    setError(error);
                }}
            />
        </div>
    );
}