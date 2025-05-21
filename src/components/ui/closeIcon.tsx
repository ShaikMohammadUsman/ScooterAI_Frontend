import React from "react";


type CloseIconProps = {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
};


export const CloseIcon: React.FC<CloseIconProps> = ({ setIsOpen, isOpen }) => {
    return (
        <svg
            className="absolute h-12 w-12 right-5 top-2 text-gray-400 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            onClick={() => setIsOpen(!isOpen)}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    );
};