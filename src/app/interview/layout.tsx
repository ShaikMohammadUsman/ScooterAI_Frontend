"use client";

import React from "react";
import ScooterHeader from "@/components/ScooterHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearCandidateAuth } from "@/lib/candidateService";
import { useRouter } from "next/navigation";

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    // const nav = (
    //     <nav className="flex items-center gap-2">
    //         {/* <Link href="/candidate/dashboard"><Button variant="ghost" className="px-3">Dashboard</Button></Link>
    //         <Link href="/candidate/applications"><Button variant="ghost" className="px-3">Applications</Button></Link>
    //         <Link href="/candidate/profile"><Button variant="ghost" className="px-3">Profile</Button></Link> */}
    //         <Button
    //             variant="ghost"
    //             className="px-3 text-red-600 hover:text-red-700"
    //             onClick={() => {
    //                 clearCandidateAuth();
    //                 router.replace("/candidate/login");
    //             }}
    //             title="Logout"
    //         >
    //             <LogOut className="h-4 w-4" />
    //         </Button>
    //     </nav>
    // );

    return (
        <div className="min-h-screen flex flex-col">
            <ScooterHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
