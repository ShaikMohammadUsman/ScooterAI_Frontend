"use client";

import React from "react";
import ScooterHeader from "@/components/ScooterHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-main text-[#2b2b2b]">
            <main className="max-w-3xl mx-auto w-full px-4 py-10">{children}</main>
        </div>
    );
}


