import { cn } from '@/lib/utils';
import React, { useState } from 'react'

interface ScooterHeaderProps {
    logo?: string;
    logoClassName?: string;
    containerClassName?: string;
    nav?: React.ReactNode; // optional navigation node
}

function ScooterHeader({ logo, logoClassName, containerClassName, nav }: ScooterHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={cn("sm:border-b border-gray-300 px-4 py-4", containerClassName)}>
            <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-4">
                <img src={logo || "/assets/images/newScooterLogo.png"} alt="Scooter Logo" className={cn("w-auto h-6 object-contain mx-auto md:mx-0", logoClassName)} />

                {/* Desktop Navigation */}
                {nav && (
                    <div className="hidden md:flex items-center gap-3">
                        {nav}
                    </div>
                )}

                {/* Mobile Hamburger Menu */}
                {nav && (
                    <div className="absolute -top-1/2 right-0 md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Dropdown */}
            {nav && isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                        <div className="flex flex-col gap-2">
                            {nav}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScooterHeader