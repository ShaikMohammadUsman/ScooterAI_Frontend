"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { userLogin, UserLoginResponse } from "@/lib/userService";
import { toast } from "@/hooks/use-toast";

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
        <div className="w-full max-w-md mx-auto">
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Continue Where You Left Off
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Enter your email to check if you have a previous application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="w-full"
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        Check Previous Application
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={onContinueWithoutLogin}
                                className="w-full h-11"
                            >
                                Continue with New Profile
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 