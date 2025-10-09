"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { superAdminResetPassword, superAdminSetPassword } from "@/lib/superAdminService";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { isValidEmail } from "@/lib/formValidation";

export default function AdminResetPasswordPage() {
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    // Refs for OTP inputs
    const otpRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));

    // Email validation
    const isEmailValid = email && email.trim() !== "" && isValidEmail(email.trim());

    // OTP validation
    const isOtpValid = otp.every(digit => digit !== "") && otp.join("").length === 6;

    // Password validation
    const passwordRules = {
        hasUpper: /[A-Z]/.test(newPassword),
        hasLower: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
        minLen: newPassword.length >= 8
    };

    const isPasswordValid = newPassword &&
        passwordRules.hasUpper &&
        passwordRules.hasLower &&
        passwordRules.hasNumber &&
        passwordRules.hasSpecial &&
        passwordRules.minLen;

    const isConfirmPasswordValid = confirmPassword === newPassword && confirmPassword !== "";

    const isPasswordFormValid = isOtpValid && isPasswordValid && isConfirmPasswordValid;

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace in OTP
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste in OTP
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }

        setOtp(newOtp);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index >= pastedData.length);
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pastedData.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const onEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) return;

        setSubmitting(true);
        setError(null);
        try {
            const res = await superAdminResetPassword({ email: email.trim() });
            if (res?.status) {
                setStep('password');
                toast({
                    variant: "success",
                    title: "Email sent successfully",
                    description: res.message || "Please check your email for the OTP code.",
                });
            } else {
                setError(res?.message || "Failed to send reset email");
            }
        } catch (err: any) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (err?.response?.data) {
                const responseData = err.response.data;
                errorMessage = responseData.message || responseData.detail || errorMessage;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error("Reset password error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const onPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordFormValid) return;

        setSubmitting(true);
        setError(null);
        try {
            const res = await superAdminSetPassword({
                email: email,
                otp: otp.join(""),
                new_password: newPassword
            });
            if (res?.status) {
                toast({
                    variant: "success",
                    title: "Password reset successfully",
                    description: res.message || "Your password has been updated successfully.",
                });
                router.push("/admin/login");
            } else {
                setError(res?.message || "Failed to reset password");
            }
        } catch (err: any) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (err?.response?.data) {
                const responseData = err.response.data;
                errorMessage = responseData.message || responseData.detail || errorMessage;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error("Set password error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl shadow-xl p-6 sm:p-10">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold">
                                {step === 'email' ? 'Reset Password' : 'Set New Password'}
                            </h2>
                            {step === 'password' && (
                                <p className="text-sm text-gray-600 mt-2">
                                    We've sent a 6-digit code to {email}
                                </p>
                            )}
                        </div>

                        {step === 'email' ? (
                            <form onSubmit={onEmailSubmit} className="space-y-5">
                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="ex: admin@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={!isEmailValid && email ? "border-red-500" : ""}
                                    />
                                    {!isEmailValid && email && (
                                        <p className="text-red-500 text-xs">Please enter a valid email address</p>
                                    )}
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        type="submit"
                                        disabled={!isEmailValid || submitting}
                                        className="w-fit"
                                        variant="primary"
                                    >
                                        {submitting ? "Sending..." : "Send Reset Code"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={onPasswordSubmit} className="space-y-5">
                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}

                                {/* OTP Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">OTP Code</label>
                                    <div className="flex gap-2 justify-center">
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                ref={(el) => {
                                                    if (otpRefs.current) {
                                                        otpRefs.current[index] = el;
                                                    }
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                                className={`w-12 h-12 text-center text-lg font-semibold ${!isOtpValid && otp.some(d => d !== "") ? "border-red-500" : ""
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {!isOtpValid && otp.some(d => d !== "") && (
                                        <p className="text-red-500 text-xs text-center">Please enter all 6 digits</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className={`pr-10 ${!isPasswordValid && newPassword ? "border-red-500" : ""}`}
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
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className={`pr-10 ${!isConfirmPasswordValid && confirmPassword ? "border-red-500" : ""}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {!isConfirmPasswordValid && confirmPassword && (
                                        <p className="text-red-500 text-xs">Passwords don't match</p>
                                    )}
                                </div>

                                {/* Password strength indicator */}
                                {newPassword && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Password Requirements:</p>
                                        <div className="space-y-1 text-sm">
                                            <div className={`flex items-center ${passwordRules.minLen ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="mr-2">{passwordRules.minLen ? '✓' : '○'}</span>
                                                At least 8 characters
                                            </div>
                                            <div className={`flex items-center ${passwordRules.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="mr-2">{passwordRules.hasUpper ? '✓' : '○'}</span>
                                                One uppercase letter
                                            </div>
                                            <div className={`flex items-center ${passwordRules.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="mr-2">{passwordRules.hasLower ? '✓' : '○'}</span>
                                                One lowercase letter
                                            </div>
                                            <div className={`flex items-center ${passwordRules.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="mr-2">{passwordRules.hasNumber ? '✓' : '○'}</span>
                                                One number
                                            </div>
                                            <div className={`flex items-center ${passwordRules.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="mr-2">{passwordRules.hasSpecial ? '✓' : '○'}</span>
                                                One special character
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <Button
                                        type="submit"
                                        disabled={!isPasswordFormValid || submitting}
                                        className="w-fit"
                                        variant="primary"
                                    >
                                        {submitting ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="my-8 border-t" />

                        <div className="flex flex-col items-center justify-center gap-3 space-y-3">
                            <p className="font-bold">Remember your password?</p>
                            <Link href="/admin/login">
                                <Button variant="secondary">Back to Login</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
