"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { superAdminLogin, isSuperAdminAccessTokenValid } from "@/lib/superAdminService";
import { useRouter } from "next/navigation";
import { getRedirectUrl, clearRedirectUrl } from "@/lib/utils";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        if (isSuperAdminAccessTokenValid()) {
            // Check if there's a redirect URL stored
            const redirectUrl = getRedirectUrl();
            if (redirectUrl) {
                clearRedirectUrl();
                router.replace(redirectUrl);
            } else {
                router.replace("/admin/dashboard");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await superAdminLogin({ email: email.trim(), password });
            if (res?.status) {
                // Check if there's a redirect URL stored
                const redirectUrl = getRedirectUrl();
                if (redirectUrl) {
                    clearRedirectUrl();
                    router.push(redirectUrl);
                } else {
                    router.push("/admin/dashboard");
                }
                return;
            }
            setError(res?.message || "Login failed");
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
        <div className="max-w-2xl mx-auto mt-10 rounded-2xl shadow-xl p-6 sm:p-10">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Super Admin Portal</h2>
                <p className="text-sm text-gray-500">Manage and oversee the entire platform</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" required />
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
                <p className="font-semibold">Forgot your password?</p>
                <Link href="/admin/reset-password"><Button variant="outline">Reset Password</Button></Link>
            </div>
        </div>
    );
}
