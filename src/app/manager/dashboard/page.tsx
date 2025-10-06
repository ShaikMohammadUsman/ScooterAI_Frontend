"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAccessTokenValid } from "@/lib/managerService";

export default function ManagerDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // Check authentication status on mount
        if (!isAccessTokenValid()) {
            router.replace("/manager/login");
        }
    }, [router]);

    // Don't render anything if not authenticated (will redirect)
    if (!isAccessTokenValid()) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">Manager Dashboard</h1>
            <p className="text-gray-600">Welcome back! Use the navigation to manage jobs and interviews.</p>
        </div>
    );
}


