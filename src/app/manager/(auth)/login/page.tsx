"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hiringManagerLogin, isAccessTokenValid } from "@/lib/managerService";
import { useRouter } from "next/navigation";
import { getRedirectUrl, clearRedirectUrl } from "@/lib/utils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        if (isAccessTokenValid()) {
            // Check if there's a redirect URL stored
            const redirectUrl = getRedirectUrl();
            if (redirectUrl) {
                clearRedirectUrl();
                router.replace(redirectUrl);
            } else {
                router.replace("/manager/dashboard");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await hiringManagerLogin({ email: email.trim(), password });
            if (res?.status) {
                toast({
                    title: "Success",
                    description: "Login successful!",
                    variant: "success"
                });
                // Check if there's a redirect URL stored
                const redirectUrl = getRedirectUrl();
                if (redirectUrl) {
                    clearRedirectUrl();
                    router.push(redirectUrl);
                } else {
                    router.push("/manager/jobs");
                }
                return;
            }
            const errorMessage = res?.message || "Login failed";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An error occurred during login";
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
        <div className="rounded-2xl shadow-xl p-6 sm:p-10">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Build your dream sales team today</h2>
                <p className="text-sm text-gray-500">Real salespeople. Real results. Really fast.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-2">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
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
                <div className="flex justify-center">
                    <Button type="submit" disabled={submitting} className="w-fit" variant="primary">
                        {submitting ? "Logging in..." : "Login"}
                    </Button>
                </div>

            </form>

            <div className="my-8 border-t" />

            <div className="text-center space-y-3">
                <p className="font-semibold">New to Scooter, Register Here</p>
                <Link href="/manager/signup"><Button variant="primary">Create an account</Button></Link>
                <div className="pt-4">
                    <p className="font-semibold">Need Help Getting Started?</p>
                    <Link href="/manager/contact-us"><Button variant="primary" className="mt-2">Contact Us</Button></Link>
                </div>
            </div>
        </div>
    );
}


