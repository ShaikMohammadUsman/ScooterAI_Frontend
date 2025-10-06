"use client";

import React, { useState, useEffect } from "react";
import ScooterHeader from "@/components/ScooterHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearManagerAuth, isAccessTokenValid } from "@/lib/managerService";
import { useRouter } from "next/navigation";
import { storeRedirectUrl, getCurrentUrlWithQuery } from "@/lib/utils";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status on mount and when it changes
        const checkAuth = () => {
            const authenticated = isAccessTokenValid();
            setIsAuthenticated(authenticated);

            // Redirect to login if not authenticated and not already on auth pages
            if (!authenticated && !window.location.pathname.includes('/manager/login') && !window.location.pathname.includes('/manager/signup')) {
                // Store current URL for redirect after login
                const currentUrl = getCurrentUrlWithQuery();
                if (currentUrl) {
                    storeRedirectUrl(currentUrl);
                }
                router.replace("/manager/login");
            }
        };

        checkAuth();

        // Listen for storage changes (e.g., when user logs in/out in another tab)
        const handleStorageChange = () => {
            checkAuth();
        };

        // Listen for custom auth change events (e.g., when user logs in/out in same tab)
        const handleAuthChange = (event: CustomEvent) => {
            setIsAuthenticated(event.detail.authenticated);
            // Also redirect if authentication is lost
            if (!event.detail.authenticated && !window.location.pathname.includes('/manager/login') && !window.location.pathname.includes('/manager/signup')) {
                // Store current URL for redirect after login
                const currentUrl = getCurrentUrlWithQuery();
                if (currentUrl) {
                    storeRedirectUrl(currentUrl);
                }
                router.replace("/manager/login");
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('managerAuthChanged', handleAuthChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('managerAuthChanged', handleAuthChange as EventListener);
        };
    }, [router]);

    const nav = (
        <nav className="flex items-center gap-2">
            <Link href="/manager/dashboard"><Button variant="ghost" className="px-3">Dashboard</Button></Link>
            <Link href="/manager/jobs"><Button variant="ghost" className="px-3">Jobs</Button></Link>
            <Link href="/manager/interviews"><Button variant="ghost" className="px-3">Interviews</Button></Link>
            {isAuthenticated && (
                <Button
                    variant="ghost"
                    className="px-3 text-red-600 hover:text-red-700"
                    onClick={() => {
                        clearManagerAuth();
                        setIsAuthenticated(false); // Update state immediately
                        router.replace("/manager/login");
                    }}
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            )}
        </nav>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <ScooterHeader nav={nav} />
            <main className="flex-1">{children}</main>
        </div>
    );
}


