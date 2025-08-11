import { motion } from "framer-motion";
import { FaMicrophone, FaSignOutAlt, FaComments, FaCheck, FaRedo } from "react-icons/fa";
import { MdOutlineChat, MdOutlineNotes } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneralInterviewControlsProps {
    isListening: boolean;
    recognizedText: string;
    retakeCount: number;
    onMicToggle: () => void;
    onLeave: () => void;
    onChatToggle: () => void;
    onSubmitAnswer: () => void;
    onRetakeAnswer: () => void;
    disabled: boolean;
    isDarkTheme?: boolean;
    isLeaving?: boolean;
    micEnabled?: boolean;
}

export function GeneralInterviewControls({
    isListening,
    recognizedText,
    retakeCount,
    onMicToggle,
    onLeave,
    onChatToggle,
    onSubmitAnswer,
    onRetakeAnswer,
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
                <div className={`flex items-center gap-4 backdrop-blur-md rounded-full px-6 py-4 shadow-lg border transition-all duration-1000 ${isDarkTheme
                    ? 'bg-gray-800/90 border-gray-600'
                    : 'bg-white/90 border-gray-200'
                    }`}>
                    {/* Chat Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onChatToggle}
                                variant="ghost"
                                size="icon"
                                className={`w-12 h-12 rounded-full transition-all duration-200 ${isDarkTheme
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                <MdOutlineChat className={`w-5 h-5 transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle chat panel</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Microphone Button - Hide when submit/retake buttons are shown */}
                    {(!recognizedText || isListening) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onMicToggle}
                                        disabled={disabled}
                                        className={`w-16 h-16 rounded-full shadow-lg transition-all duration-200 ${isListening
                                            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                            : "bg-blue-600 hover:bg-blue-700 text-white"
                                            }`}
                                    >
                                        <FaMicrophone className="w-6 h-6" />
                                        {isListening && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-red-400"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.5, 0, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        )}
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isListening ? "Stop recording" : "Start recording"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* User's turn to speak tooltip - shows when micEnabled but not listening */}
                    {micEnabled && !isListening && !recognizedText && (
                        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20">
                            <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
                                🎤 Click to start speaking
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                        </div>
                    )}

                    {/* Submit/Retake Buttons */}
                    {recognizedText && !isListening && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-2"
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

                            {retakeCount === 0 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={onRetakeAnswer}
                                            variant="outline"
                                            disabled={disabled}
                                            className="w-12 h-12 p-0 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-200"
                                        >
                                            <FaRedo className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Retake answer</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </motion.div>
                    )}

                    {/* Leave Interview */}
                    <Tooltip>
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
                    </Tooltip>
                </div>
            </motion.div>
        </TooltipProvider>
    );
} 