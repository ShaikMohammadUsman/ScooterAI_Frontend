import React from 'react';
import { LucideLoader } from 'lucide-react';
import { IconContext } from 'react-icons';

const CreditCheckCard: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex justify-center flex-col items-center bg-white shadow-md rounded-lg p-6 max-w-sm w-full text-center">
                <h1 className="text-xl font-semibold text-gray-800 mb-4">Checking for Credit</h1>
                <IconContext.Provider value={{ className: "text-blue-500 text-center mx-auto animate-spin border-2", size: "3em" }}>
                    <LucideLoader className='animate-spin border-2' />
                </IconContext.Provider>
                <p className="text-gray-600 mt-4">Please wait...</p>
            </div>
        </div>
    );
}

export default CreditCheckCard;
