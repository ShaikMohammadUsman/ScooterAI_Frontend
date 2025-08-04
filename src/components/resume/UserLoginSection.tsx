"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { userLogin, UserLoginResponse } from "@/lib/userService";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface UserLoginSectionProps {
    onLoginSuccess: (userData: UserLoginResponse) => void;
    onContinueWithoutLogin: () => void;
}

export default function UserLoginSection({ onLoginSuccess, onContinueWithoutLogin }: UserLoginSectionProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await userLogin(email.trim());

            if (response.status) {
                const message = response.data.audio_interview_attended
                    ? `Found your previous application for ${response.job_data?.job_title || 'the position'} (Interview completed)`
                    : `Found your previous application for ${response.job_data?.job_title || 'the position'}`;

                toast({
                    title: "Welcome back!",
                    description: message,
                });
                onLoginSuccess(response);
            } else {
                setError("No previous application found with this email. You can continue to create a new profile.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to check for previous applications");
            toast({
                title: "Error",
                description: err.message || "Failed to check for previous applications",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto relative">


            <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden relative">

                {/* Branding header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image
                            src="/assets/images/scooterLogo.png"
                            alt="Scooter AI"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div className="text-white">
                            <h1 className="text-xl font-bold">Scooter AI</h1>
                            <p className="text-blue-100 text-sm">Intelligent Hiring Platform</p>
                        </div>
                    </div>

                    {/* Decorative elements in header */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <Target className="w-4 h-4 text-yellow-300" />
                    </div>
                </div>

                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        Ready to Accelerate Your Career?
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                        Whether you're a returning candidate or starting fresh, let's get you on the fast track to your next opportunity.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
                                    required
                                />
                                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="border-red-200 bg-red-50">
                                <AlertDescription className="text-red-700">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Checking Your Profile...
                                    </>
                                ) : (
                                    <>
                                        Check Your Profile
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">or</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={onContinueWithoutLogin}
                                className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                            >
                                Start Fresh Application
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Secure & Private</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>AI-Powered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Fast Process</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 