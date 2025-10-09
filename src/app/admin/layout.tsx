"use client";

import React, { useState, useEffect } from "react";
import ScooterHeader from "@/components/ScooterHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearSuperAdminAuth, isSuperAdminAccessTokenValid } from "@/lib/superAdminService";
import { useRouter } from "next/navigation";
import { storeRedirectUrl, getCurrentUrlWithQuery } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status on mount and when it changes
        const checkAuth = () => {
            const authenticated = isSuperAdminAccessTokenValid();
            setIsAuthenticated(authenticated);

            // Redirect to login if not authenticated and not already on auth pages
            if (!authenticated && !window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/reset-password')) {
                // Store current URL for redirect after login
                const currentUrl = getCurrentUrlWithQuery();
                if (currentUrl) {
                    storeRedirectUrl(currentUrl);
                }
                router.replace("/admin/login");
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
            if (!event.detail.authenticated && !window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/reset-password')) {
                // Store current URL for redirect after login
                const currentUrl = getCurrentUrlWithQuery();
                if (currentUrl) {
                    storeRedirectUrl(currentUrl);
                }
                router.replace("/admin/login");
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('superAdminAuthChanged', handleAuthChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('superAdminAuthChanged', handleAuthChange as EventListener);
        };
    }, [router]);

    const nav = (
        <nav className="flex items-center gap-2">
            <Link href="/admin/dashboard"><Button variant="ghost" className="px-3">Dashboard</Button></Link>
            <Link href="/admin/users"><Button variant="ghost" className="px-3">Users</Button></Link>
            <Link href="/admin/jobs"><Button variant="ghost" className="px-3">Jobs</Button></Link>
            <Link href="/admin/analytics"><Button variant="ghost" className="px-3">Analytics</Button></Link>
            <Link href="/admin/settings"><Button variant="ghost" className="px-3">Settings</Button></Link>
            {isAuthenticated && (
                <Button
                    variant="ghost"
                    className="px-3 text-red-600 hover:text-red-700"
                    onClick={() => {
                        clearSuperAdminAuth();
                        setIsAuthenticated(false); // Update state immediately
                        router.replace("/admin/login");
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
