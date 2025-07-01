'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { FaHome, FaBriefcase, FaSearch, FaSignOutAlt, FaBars } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [companyName, setCompanyName] = useState('Welcome back!');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        const companyDetails = localStorage.getItem('company_details');
        if (companyDetails) {
            const companyDetailsObj = JSON.parse(companyDetails);
            setCompanyName('Welcome ' + companyDetailsObj.company_name);
        }
        if (!companyId && pathname !== '/company') {
            router.push('/company');
        }
        if (companyId) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('company_id');
        localStorage.removeItem('company_details');
        toast({
            title: "Success",
            description: "Logout successful!",
            variant: "default"
        });
        router.push('/company');
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen">
                <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-8 py-6 border-b border-muted bg-white/80">
                    <div className="text-2xl font-bold font-stretch-ultra-condensed text-[#063d6e]">TheSc<Image src="/assets/images/scooterLogo.png" alt="ScooterAI" width={35} height={35} className="inline-block relative -top-2" />ter.ai</div>
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 justify-center items-center text-muted-foreground font-medium text-lg">
                        <Link href="/home" className="hover:text-primary transition-colors">About</Link>
                        <Link href="/home/careers" className="hover:text-primary transition-colors">Careers</Link>
                        <Link href="/company" className="hover:text-slate-500 transition-colors bg-cyan-400 text-white px-4 py-2 rounded-md">Post Jobs</Link>
                    </nav>
                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                    {/* Mobile Nav Dropdown */}
                    {menuOpen && (
                        <div className="absolute top-full right-8 mt-2 w-48 bg-white border border-muted rounded-lg shadow-lg flex flex-col z-50 animate-fade-in">
                            <Link href="/home" className="px-6 py-3 hover:bg-primary/10 transition-colors border-b border-muted" onClick={() => setMenuOpen(false)}>About</Link>
                            <Link href="/home/careers" className="px-6 py-3 hover:bg-primary/10 transition-colors border-b border-muted" onClick={() => setMenuOpen(false)}>Careers</Link>
                            <Link href="/company" className="px-6 py-3 hover:bg-cyan-400 hover:text-white transition-colors rounded-b-md" onClick={() => setMenuOpen(false)}>Post Jobs</Link>
                        </div>
                    )}
                </header>
                <div className="mt-20">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left section */}
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-semibold text-indigo-700">
                                {companyName}
                            </div>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex space-x-4">
                                <NavButton
                                    label="Dashboard"
                                    icon={<FaHome />}
                                    active={pathname === '/company/dashboard'}
                                    onClick={() => router.push('/company/dashboard')}
                                />
                                <NavButton
                                    label="Jobs"
                                    icon={<FaBriefcase />}
                                    active={pathname.startsWith('/company/jobs')}
                                    onClick={() => router.push('/company/jobs')}
                                />
                                <NavButton
                                    label="Search"
                                    icon={<FaSearch />}
                                    active={pathname === '/company/search'}
                                    onClick={() => router.push('/company/search')}
                                />
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block">
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="inline-flex items-center"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </Button>
                            </div>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden text-gray-700 focus:outline-none"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <FaBars size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden px-4 pb-4 space-y-2">
                        <NavButton
                            label="Dashboard"
                            icon={<FaHome />}
                            active={pathname === '/company/dashboard'}
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push('/company/dashboard');
                            }}
                        />
                        <NavButton
                            label="Jobs"
                            icon={<FaBriefcase />}
                            active={pathname.startsWith('/company/jobs')}
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push('/company/jobs');
                            }}
                        />
                        <NavButton
                            label="Search"
                            icon={<FaSearch />}
                            active={pathname === '/company/search'}
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push('/company/search');
                            }}
                        />
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="w-full justify-start inline-flex items-center"
                        >
                            <FaSignOutAlt className="mr-2" />
                            Logout
                        </Button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="">{children}</main>
        </div>
    );
}

function NavButton({
    label,
    icon,
    active,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            variant={active ? 'default' : 'ghost'}
            onClick={onClick}
            className={`inline-flex items-center space-x-2 px-3 py-2 transition-all duration-150 ${active ? 'text-white' : 'text-gray-700 hover:text-indigo-700'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Button>
    );
}
