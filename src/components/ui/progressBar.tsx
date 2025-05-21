import { useState } from 'react';

interface ProgressBarProps {
    levels: number;
    active: number | undefined;
}

const ProgressBar = ({ levels, active }: ProgressBarProps) => {
    const [activeLevel, setActiveLevel] = useState(active);

    return (
        <div className="flex items-center justify-center space-x-4 my-2">
            {Array.from({ length: levels }, (_, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <div
                        className={`w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center 
                        ${activeLevel !== undefined && index === activeLevel ? 'bg-sidebar text-sidebar-foreground scale-125' : ''}
                        ${activeLevel !== undefined && index < activeLevel ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                    >
                        {index + 1}
                    </div>
                    {index < levels - 1 && (
                        <div
                            className={`w-8 h-1 
                            ${activeLevel !== undefined && index < activeLevel ? 'bg-primary' : 'bg-primary-foreground'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProgressBar;
