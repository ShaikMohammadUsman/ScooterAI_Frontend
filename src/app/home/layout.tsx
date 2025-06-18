import Link from 'next/link';
import React from 'react'
import Image from 'next/image';

function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-8 py-6 border-b border-muted bg-white/80">
                <div className="text-2xl font-bold font-stretch-ultra-condensed text-[#063d6e]">TheSc<Image src="/assets/images/scooterLogo.png" alt="ScooterAI" width={35} height={35} className="inline-block relative -top-2" />ter.ai</div>
                <nav className="flex gap-8 justify-center items-center text-muted-foreground font-medium text-lg">
                    <Link href="/home" className="hover:text-primary transition-colors">About</Link>
                    <Link href="/home/careers" className="hover:text-primary transition-colors">Careers</Link>
                    <Link href="/company" className="hover:text-slate-500 transition-colors bg-cyan-400 text-white px-4 py-2 rounded-md">Post Jobs</Link>
                </nav>
            </header>
            <div className="">
                {children}
            </div>
            {/* Footer */}
            <footer className="w-full text-center text-muted-foreground py-6 border-t border-muted bg-white/80 text-sm">
                © 2025 Scooter Technologies. All rights reserved.
            </footer>
        </div>

    )
}

export default HomeLayout;