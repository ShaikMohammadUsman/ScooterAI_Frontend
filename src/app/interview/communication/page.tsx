"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function CommunicationInterview() {
    const router = useRouter();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-8 px-2">
            <Card className="w-full max-w-2xl mx-auto shadow-lg p-0">
                <CardHeader className="flex flex-row items-center gap-3 border-b bg-white/80">
                    <div className="text-primary w-7 h-7">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Communication Skills Interview</CardTitle>
                </CardHeader>
                <CardContent className="py-12 flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-6 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        We're currently preparing an interactive communication skills assessment. This will help us evaluate your ability to effectively communicate in a sales environment.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => {
                            router.back();
                        }}>
                            Go Back
                        </Button>
                        <Button>
                            Notify Me When Ready
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CommunicationInterview;