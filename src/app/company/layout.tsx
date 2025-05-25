'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { FaHome, FaBriefcase, FaSearch, FaSignOutAlt, FaBars } from 'react-icons/fa';

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [companyName, setCompanyName] = useState('Welcome back!');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        const storedName = localStorage.getItem('company_name');
        setCompanyName('Welcome' + (storedName ? ' ' + storedName : ''));
        if (!companyId && pathname !== '/company/auth') {
            router.push('/company/auth');
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('company_id');
        localStorage.removeItem('company_name');
        router.push('/company/auth');
    };

    if (pathname === '/company/auth') {
        return children;
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
            <main className="p-4 sm:p-6">{children}</main>
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
