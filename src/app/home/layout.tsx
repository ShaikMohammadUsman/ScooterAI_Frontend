'use client'
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

function HomeLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-8 py-6 border-b border-muted bg-white/80">
                <div className="text-2xl font-bold font-stretch-ultra-condensed text-[#063d6e]">TheSc<Image src="/assets/images/scooterLogo.png" alt="ScooterAI" width={35} height={35} className="inline-block relative -top-2" />ter.ai</div>
                {/* Desktop Nav */}
                {/* <nav className="hidden md:flex gap-8 justify-center items-center text-muted-foreground font-medium text-lg">
                    <Link href="/home" className="hover:text-primary transition-colors">About</Link>
                    <Link href="/home/careers" className="hover:text-primary transition-colors">Careers</Link>
                    <Link href="/company" className="hover:text-slate-500 transition-colors bg-cyan-400 text-white px-4 py-2 rounded-md">Post Jobs</Link>
                </nav> */}
                {/* Hamburger for mobile */}
                <button
                    className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                    {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
                {/* Mobile Nav Dropdown */}
                {/* {menuOpen && (
                    <div className="absolute top-full right-8 mt-2 w-48 bg-white border border-muted rounded-lg shadow-lg flex flex-col z-50 animate-fade-in">
                        <Link href="/home" className="px-6 py-3 hover:bg-primary/10 transition-colors border-b border-muted" onClick={() => setMenuOpen(false)}>About</Link>
                        <Link href="/home/careers" className="px-6 py-3 hover:bg-primary/10 transition-colors border-b border-muted" onClick={() => setMenuOpen(false)}>Careers</Link>
                        <Link href="/company" className="px-6 py-3 hover:bg-cyan-400 hover:text-white transition-colors rounded-b-md" onClick={() => setMenuOpen(false)}>Post Jobs</Link>
                    </div>
                )} */}
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