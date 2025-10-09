"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSuperAdminAccessTokenValid } from "@/lib/superAdminService";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        if (isSuperAdminAccessTokenValid()) {
            router.replace("/admin/dashboard");
        } else {
            router.replace("/admin/login");
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <img src="/assets/images/newScooterLogo.png" alt="Scooter Logo" className="w-auto h-15 sm:h-20 md:h-30 lg:h-40 mx-auto object-contain mb-4" />
                <h1 className="text-2xl font-semibold mb-4">Super Admin Portal</h1>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}
