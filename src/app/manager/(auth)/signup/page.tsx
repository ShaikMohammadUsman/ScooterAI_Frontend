"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
        <div className="rounded-2xl p-6 sm:p-10">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Build your dream sales team today</h2>
                <p className="text-sm text-gray-500">Real salespeople. Real results. Really fast.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <Input id="password" type="password" className="mt-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
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


