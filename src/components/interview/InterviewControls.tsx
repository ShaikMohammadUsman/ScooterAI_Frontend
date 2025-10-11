import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    FaMicrophone,
    FaStopCircle
} from 'react-icons/fa';


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
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 sm:mb-8">
                <div className="flex items-center gap-6 sm:gap-10 px-6 py-3  rounded-full">

                    {/* Chat Button */}
                    {/* <Tooltip>
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
                    </Tooltip> */}
                    {/* Retake Answer Button - Always visible, disabled until active */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 text-white shadow-md shadow-cta-primary ${recognizedText && !isListening && retakeCount === 0
                                    ? 'bg-cta-primary hover:bg-cta-secondary hover:text-cta-primary border-cta-outline'
                                    : 'bg-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
                                    }`}
                                onClick={onRetakeAnswer}
                                disabled={disabled || !(recognizedText && !isListening && retakeCount === 0)}
                            >
                                <svg className="w-5 h-5 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Retake answer</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Microphone Button - Always visible, changes state based on listening */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 text-white shadow-lg shadow-cta-primary ${isListening
                                        ? 'bg-muted hover:bg-muted text-cta-secondary-text'
                                        : 'bg-cta-outline hover:bg-cta-secondary hover:text-cta-primary border-cta-outline'
                                        }`}
                                    onClick={onMicToggle}
                                    disabled={disabled || !!(recognizedText && !isListening && retakeCount === 0)}
                                >
                                    {
                                        isListening ? (
                                            <FaStopCircle className="w-6 h-6 sm:w-12 sm:h-12" />
                                        ) : (
                                            <FaMicrophone className="w-6 h-6 sm:w-12 sm:h-12" />
                                        )
                                    }

                                    {/* Ripple effect when listening */}
                                    {isListening && (
                                        <>
                                            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-grad-1 animate-ping opacity-75"></div>
                                            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-grad-2 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                                        </>
                                    )}
                                </Button>




                                {/* User's turn to speak tooltip - shows when micEnabled but not listening */}
                                {micEnabled && !isListening && !recognizedText && (
                                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20 w-fit">
                                        <div className="min-w-56 max-w-80 bg-muted text-cta-secondary-text px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
                                            Press the START RECORDING button to record you answer
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-muted-foreground"></div>
                                    </div>
                                )}

                                {/* Stop listening tooltip - shows when user is currently listening */}
                                {isListening && (
                                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20 w-fit">
                                        <div className="min-w-56 max-w-80 bg-muted text-cta-secondary-text text-center px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
                                            Once you are done with your answer, click the STOP RECORDING button to stop the recording.
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-muted-foreground"></div>
                                    </div>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isListening ? 'Stop recording' : 'Start recording'}</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Submit Answer Button - Always visible, disabled until active */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 text-white shadow-md shadow-cta-primary ${recognizedText && !isListening
                                    ? 'bg-cta-primary hover:bg-cta-secondary hover:text-cta-primary border-cta-outline'
                                    : 'bg-gray-600 border-gray-600 opacity-50 cursor-not-allowed'
                                    }`}
                                onClick={onSubmitAnswer}
                                disabled={disabled || !(recognizedText && !isListening)}
                            >
                                <svg className="w-5 h-5 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Submit answer</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Camera Button */}
                    {/* <Tooltip>
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
                    </Tooltip> */}


                    {/* Leave Button */}
                    {/* <Tooltip>
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
                            <p>{isLeaving ? "Saving progress..." : "Leave interaction"}</p>
                        </TooltipContent>
                    </Tooltip> */}
                </div>
            </div>
        </TooltipProvider>
    );
};

export default InterviewControls; 