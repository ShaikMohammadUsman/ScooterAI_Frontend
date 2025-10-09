"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hiringManagerSignup, isAccessTokenValid } from "@/lib/managerService";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const passwordRules = useMemo(() => ({
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
        minLen: password.length >= 8
    }), [password]);

    const isPasswordValid = passwordRules.hasUpper && passwordRules.hasLower && passwordRules.hasNumber && passwordRules.hasSpecial && passwordRules.minLen;

    useEffect(() => {
        if (isAccessTokenValid()) {
            router.replace("/manager/dashboard");
        }
    }, []);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (!isPasswordValid) {
                const errorMessage = "Please satisfy all password requirements.";
                setError(errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
                return;
            }
            if (password !== confirmPassword) {
                const errorMessage = "Passwords do not match.";
                setError(errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
                return;
            }
            const res = await hiringManagerSignup({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                password
            });
            if (res?.status) {
                toast({
                    title: "Success",
                    description: "Signup successful!",
                    variant: "success"
                });
                router.push("/manager/jobs");
                return;
            }
            const errorMessage = res?.message || "Signup failed";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An error occurred during signup";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl p-6 sm:p-10">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Build your dream sales team today</h2>
                <p className="text-sm text-gray-500">Real salespeople. Real results. Really fast.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" className="mt-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required />
                    </div>
                    <div>
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" className="mt-2" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
                    </div>
                </div>
                <div>
                    <Label htmlFor="email">Company Email ID</Label>
                    <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} placeholder="••••••••" required />
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
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-2">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
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
                </div>
                <div className="flex justify-center">
                    <Button type="submit" disabled={submitting} className="w-fit mx-auto" variant="primary">
                        {submitting ? "Signing Up..." : "Sign Up"}
                    </Button>
                </div>

            </form>

            <div className="my-8 border-t" />

            <div className="text-center space-y-3">
                <p className="font-semibold">Already Registered? Login Here</p>
                <Link href="/manager/login"><Button variant="primary">Login</Button></Link>
                <div className="pt-4">
                    <p className="font-semibold">Need Help Getting Started?</p>
                    <Link href="/manager/contact-us"><Button variant="primary" className="mt-2">Contact Us</Button></Link>
                </div>
            </div>
        </div>
    );
}


