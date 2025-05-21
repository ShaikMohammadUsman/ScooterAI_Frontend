import React from 'react';

const LoadingSpinner: React.FC = ({ text }: { text?: string }) => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-accent"></div>
            {text && <p className="text-gray-600 text-md font-semibold font-merienda">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
