"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { contactUs } from "@/lib/managerService";
import { toast } from "@/hooks/use-toast";

export default function ContactUsPage() {
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [designation, setDesignation] = useState("");
    const [email, setEmail] = useState("");
    const [query, setQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await contactUs({
                name,
                designation,
                companyName: company,
                companyEmail: email,
                query: query || "No specific query provided"
            });

            if (response.status) {
                toast({
                    title: "Success!",
                    description: response.message,
                });
                // Reset form
                setName("");
                setCompany("");
                setDesignation("");
                setEmail("");
                setQuery("");
            } else {
                setError(response.message || "Failed to submit your query. Please try again.");
            }
        } catch (err: any) {
            console.error("Contact us error:", err);
            setError(err.response?.data?.message || "Failed to submit your query. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className=" rounded-2xl p-6 sm:p-10">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Get Unstuck in 15 Minutes</h2>
                <p className="text-sm text-gray-500">Quick chat, big impact on your next hire</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={name} className="mt-2" onChange={(e) => setName(e.target.value)} placeholder="Rashmi Sethia" required />
                    </div>
                    <div>
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={company} className="mt-2" onChange={(e) => setCompany(e.target.value)} placeholder="XYZ Company" required />
                    </div>
                    <div>
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" value={designation} className="mt-2" onChange={(e) => setDesignation(e.target.value)} placeholder="Talent Acquisition Manager" required />
                    </div>
                    <div>
                        <Label htmlFor="email">Company Email ID</Label>
                        <Input id="email" type="email" value={email} className="mt-2" onChange={(e) => setEmail(e.target.value)} placeholder="name@xyzcompany.com" required />
                    </div>
                </div>

                <div>
                    <Label htmlFor="query">Submit Your Query (optional)</Label>
                    <Textarea id="query" value={query} className="mt-2" onChange={(e) => setQuery(e.target.value)} placeholder="Type here..." rows={6} />
                </div>

                <div className="text-center">
                    <Button type="submit" disabled={submitting} className="px-8" variant="primary">
                        {submitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>

            <div className="text-center mt-10 flex flex-col items-center justify-center gap-2">
                <p className="font-semibold">Looking For A Quicker Resolution?</p>
                <p className="text-sm text-gray-600">Get on a call with us right now!</p>
                <a className="text-blue-600 underline" href="https://calendly.com/scooter.ai" target="_blank" rel="noreferrer">calendly.com/scooter.ai</a>
            </div>
        </div>
    );
}


