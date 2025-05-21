import { useState, useEffect } from 'react';

interface Props {
    text: string;
}

const texts = [
    'This will take few minutes...',
    'Just a few seconds more...',
    'Almost there...',
    'Please wait...',
];

const LoadingComponent: React.FC<Props> = ({ text = "loading..." }) => {
    const [displayText, setDisplayText] = useState(text);
    const [isMounted, setIsMounted] = useState(false);

    let index = 0;

    // useEffect(() => {
    //     setIsMounted(true);
    //     const intervalId = setInterval(() => {
    //         if (displayText.length < text.length) {
    //             setDisplayText(text.substring(0, displayText.length + 1));
    //         } else {
    //             clearInterval(intervalId);
    //         }
    //     }, 50);
    //     return () => clearInterval(intervalId);
    // }, [text, displayText]);

    useEffect(() => {
        setIsMounted(true);
        const intervalId = setInterval(() => {
            setDisplayText(texts[index]);
            index = (index + 1) % texts.length;
        }, 40000);
        return () => clearInterval(intervalId);
    }, [texts]);


    return (
        <div
            className="z-[102] fixed top-0 left-0 w-full h-full bg-gray-200 bg-opacity-80 backdrop-filter backdrop-blur-md flex items-center justify-center"
        >
            <div className="text-3xl text-gray-600 font-bold relative">
                {displayText}
                {isMounted && displayText.length === text.length && (
                    <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-blue-400 animate-bounce" />
                )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="relative flex space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-400 animate-bounce " />
                    <div className=" w-4 h-4 rounded-full bg-blue-400 animate-bounce delay-100" />
                    <div className="w-4 h-4 rounded-full bg-blue-400 animate-bounce delay-200" />
                </div>
            </div>
        </div>
    );
};

export default LoadingComponent;