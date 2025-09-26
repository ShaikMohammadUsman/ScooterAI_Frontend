import { cn } from '@/lib/utils';
import React from 'react'

interface ScooterHeaderProps {
    logo?: string;
    logoClassName?: string;
    containerClassName?: string;
}

function ScooterHeader({ logo, logoClassName, containerClassName }: ScooterHeaderProps) {
    return (
        <div className={cn("border-b border-gray-300 px-4 py-4", containerClassName)}>
            <img src={logo || "/assets/images/newScooterLogo.png"} alt="Scooter Logo" className={cn("w-auto h-6 object-contain", logoClassName)} />
        </div>
    )
}

export default ScooterHeader