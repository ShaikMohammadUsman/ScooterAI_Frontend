"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // TODO: wire up API
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
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
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


