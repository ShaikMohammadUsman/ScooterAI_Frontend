import { cn } from '@/lib/utils';
import React from 'react'

interface ScooterHeaderProps {
    logo?: string;
    logoClassName?: string;
    containerClassName?: string;
    nav?: React.ReactNode; // optional navigation node
}

function ScooterHeader({ logo, logoClassName, containerClassName, nav }: ScooterHeaderProps) {
    return (
        <div className={cn("border-b border-gray-300 px-4 py-4", containerClassName)}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <img src={logo || "/assets/images/newScooterLogo.png"} alt="Scooter Logo" className={cn("w-auto h-6 object-contain", logoClassName)} />
                {nav && (
                    <div className="hidden md:flex items-center gap-3">
                        {nav}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScooterHeader