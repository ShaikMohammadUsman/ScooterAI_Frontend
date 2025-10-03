import { motion } from "framer-motion";
import { FaMicrophone, FaSignOutAlt, FaComments, FaCheck, FaStop, FaStopCircle } from "react-icons/fa";
import { MdOutlineChat, MdOutlineNotes } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneralInterviewControlsProps {
    isListening: boolean;
    recognizedText: string;
    // retakeCount: number;
    onMicToggle: () => void;
    onLeave: () => void;
    onChatToggle: () => void;
    onSubmitAnswer: () => void;
    // onRetakeAnswer: () => void;
    disabled: boolean;
    isDarkTheme?: boolean;
    isLeaving?: boolean;
    micEnabled?: boolean;
}

export function GeneralInterviewControls({
    isListening,
    recognizedText,
    // retakeCount,
    onMicToggle,
    onLeave,
    onChatToggle,
    onSubmitAnswer,
    // onRetakeAnswer,
    disabled,
    isDarkTheme = false,
    isLeaving = false,
    micEnabled = false
}: GeneralInterviewControlsProps) {
    return (
        <TooltipProvider>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
            >
                <div className={`flex items-center gap-4 backdrop-blur-md rounded-full px-6 py-4  transition-all duration-1000}`}>


                    {/* Microphone Button */}
                    <div className="flex flex-col items-center gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="relative">
                                        {isListening && (
                                            <span className="absolute -inset-3 rounded-full bg-green-500/30 animate-ping" />
                                        )}
                                        <Button
                                            onClick={onMicToggle}
                                            disabled={disabled}
                                            // variant="primary"
                                            className={`relative w-16 h-16 sm:w-28 sm:h-28 rounded-full transition-all duration-200 shadow-lg shadow-cta-primary ${isListening
                                                ? "bg-muted hover:bg-muted-foreground text-cta-secondary-text"
                                                : "bg-cta-primary text-cta-primary-text"
                                                }`}
                                        >
                                            {
                                                isListening ? (
                                                    <FaStopCircle className="w-6 h-6 sm:w-10 sm:h-10" />
                                                ) : (
                                                    <FaMicrophone className="w-6 h-6 sm:w-10 sm:h-10" />
                                                )
                                            }
                                            {isListening && (
                                                <motion.div
                                                    className="pointer-events-none absolute inset-0 rounded-full bg-red-400/40"
                                                    animate={{
                                                        scale: [1, 1.15, 1],
                                                        opacity: [0.5, 0.15, 0.5]
                                                    }}
                                                    transition={{
                                                        duration: 1.4,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isListening ? "Stop recording" : "Start recording"}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Status Text */}
                        <div className="text-center">
                            <div className={`text-lg font-semibold ${isListening ? 'text-green-600' : 'text-gray-700'}`}>
                                {isListening ? "We're Listening" : "Start Recording"}
                            </div>
                            <div className={`text-sm font-medium ${isListening ? 'text-green-600' : 'text-gray-500'}`}>
                                MIC IS {isListening ? 'ON' : 'OFF'}
                            </div>
                        </div>
                    </div>

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

                    {/* Submit Button */}
                    {/* {recognizedText && !isListening && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onSubmitAnswer}
                                        disabled={disabled}
                                        className="w-12 h-12 p-0 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200"
                                    >
                                        <FaCheck className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Submit answer</p>
                                </TooltipContent>
                            </Tooltip>
                            
                        </motion.div>
                    )} */}

                    {/* Leave Interview */}
                    {/* <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onLeave}
                                variant="ghost"
                                size="icon"
                                disabled={isLeaving}
                                className={`w-12 h-12 rounded-full transition-all duration-200 ${isDarkTheme
                                    ? 'bg-red-900/50 hover:bg-red-800/50'
                                    : 'bg-red-100 hover:bg-red-200'
                                    }`}
                            >
                                <FaSignOutAlt className={`w-5 h-5 transition-colors duration-1000 ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isLeaving ? "Saving progress..." : "Leave interview"}</p>
                        </TooltipContent>
                    </Tooltip> */}
                </div>
            </motion.div>
        </TooltipProvider>
    );
} 