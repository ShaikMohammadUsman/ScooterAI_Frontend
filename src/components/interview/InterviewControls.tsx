import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    FaMicrophone,
    FaVideo,
    FaDesktop,
    FaUsers,
    FaEllipsisV,
    FaSignOutAlt,
    FaStickyNote,
    FaComments,
    FaSignal
} from 'react-icons/fa';
import {
    MdOutlineScreenShare,
    MdOutlineMoreVert,
    MdOutlineChat,
    MdOutlineNotes,
    MdOutlineSignalCellular4Bar
} from 'react-icons/md';
import {
    HiOutlineSparkles,
    HiOutlineDocument
} from 'react-icons/hi';

interface InterviewControlsProps {
    isListening: boolean;
    isCameraOn: boolean;
    recognizedText?: string;
    retakeCount?: number;
    onMicToggle: () => void;
    onCameraToggle: () => void;
    onLeave: () => void;
    onTakeNotes: () => void;
    onChatToggle: () => void;
    onSubmitAnswer: () => void;
    onRetakeAnswer: () => void;
    disabled?: boolean;
    isLeaving?: boolean;
    micEnabled?: boolean;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
    isListening,
    isCameraOn,
    recognizedText = "",
    retakeCount = 0,
    onMicToggle,
    onCameraToggle,
    onLeave,
    onTakeNotes,
    onChatToggle,
    onSubmitAnswer,
    onRetakeAnswer,
    disabled = false,
    isLeaving = false,
    micEnabled = false
}) => {
    return (
        <TooltipProvider>
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-900/95 backdrop-blur-sm rounded-full border border-gray-700 shadow-2xl">

                    {/* Microphone Button - Only show when not listening and no recognized text */}
                    {!isListening && !recognizedText && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-14 h-14 rounded-full border-2 bg-gray-800 hover:bg-gray-700 border-gray-600 text-white"
                                        onClick={onMicToggle}
                                        disabled={disabled}
                                    >
                                        <FaMicrophone className="w-6 h-6" />
                                    </Button>
                                    {/* User's turn to speak tooltip - shows when micEnabled but not listening */}
                                    {micEnabled && !isListening && !recognizedText && (
                                        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20">
                                            <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
                                                🎤 Click to start speaking
                                            </div>
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Start recording</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Stop Recording Button - Show when listening */}
                    {isListening && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-14 h-14 rounded-full border-2 bg-red-600 hover:bg-red-700 border-red-500 text-white animate-pulse relative z-10"
                                        onClick={onMicToggle}
                                        disabled={disabled}
                                    >
                                        <FaMicrophone className="w-6 h-6" />
                                    </Button>
                                    {/* Ripple effect */}
                                    <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
                                    <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-red-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Stop recording</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Submit Answer Button - Show when there's recognized text and not listening */}
                    {recognizedText && !isListening && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-14 h-14 rounded-full border-2 bg-green-600 hover:bg-green-700 border-green-500 text-white"
                                    onClick={onSubmitAnswer}
                                    disabled={disabled}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Submit answer</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Retake Answer Button - Show when user has recorded an answer and can retake */}
                    {recognizedText && !isListening && retakeCount === 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-14 h-14 rounded-full border-2 bg-yellow-400 hover:bg-yellow-500 border-yellow-400 text-white"
                                    onClick={onRetakeAnswer}
                                    disabled={disabled}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Retake answer</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Camera Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white ${!isCameraOn ? 'opacity-60' : ''
                                    }`}
                                onClick={onCameraToggle}
                                disabled={disabled}
                            >
                                {isCameraOn ? (
                                    <FaVideo className="w-5 h-5" />
                                ) : (
                                    <div className="relative">
                                        <FaVideo className="w-5 h-5" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-0.5 h-5 bg-white transform rotate-45"></div>
                                        </div>
                                    </div>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isCameraOn ? 'Turn off camera' : 'Turn on camera'}</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Chat Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white"
                                onClick={onChatToggle}
                                disabled={disabled}
                            >
                                <MdOutlineChat className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle chat panel</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Leave Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium"
                                onClick={onLeave}
                                disabled={disabled || isLeaving}
                            >
                                {isLeaving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    "Leave"
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isLeaving ? "Saving progress..." : "Leave interview"}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default InterviewControls; 