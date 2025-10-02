"use client";

import React from "react";
import ScooterHeader from "@/components/ScooterHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearManagerAuth } from "@/lib/managerService";
import { useRouter } from "next/navigation";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const nav = (
        <nav className="flex items-center gap-2">
            <Link href="/manager/dashboard"><Button variant="ghost" className="px-3">Dashboard</Button></Link>
            <Link href="/manager/jobs"><Button variant="ghost" className="px-3">Jobs</Button></Link>
            <Link href="/manager/interviews"><Button variant="ghost" className="px-3">Interviews</Button></Link>
            <Button
                variant="ghost"
                className="px-3 text-red-600 hover:text-red-700"
                onClick={() => {
                    clearManagerAuth();
                    router.replace("/manager/login");
                }}
                title="Logout"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </nav>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <ScooterHeader nav={nav} />
            <main className="flex-1">{children}</main>
        </div>
    );
}


