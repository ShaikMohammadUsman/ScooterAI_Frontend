import { motion } from "framer-motion";
import { FaMicrophone, FaSignOutAlt, FaComments, FaCheck, FaRedo } from "react-icons/fa";
import { MdOutlineChat, MdOutlineNotes } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface GeneralInterviewControlsProps {
    isListening: boolean;
    recognizedText: string;
    canRetake: boolean;
    retakeCount: number;
    onMicToggle: () => void;
    onLeave: () => void;
    onChatToggle: () => void;
    onSubmitAnswer: () => void;
    onRetakeAnswer: () => void;
    disabled: boolean;
}

export function GeneralInterviewControls({
    isListening,
    recognizedText,
    canRetake,
    retakeCount,
    onMicToggle,
    onLeave,
    onChatToggle,
    onSubmitAnswer,
    onRetakeAnswer,
    disabled
}: GeneralInterviewControlsProps) {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-full px-6 py-4 shadow-lg border border-gray-200">
                {/* Chat Toggle */}
                <Button
                    onClick={onChatToggle}
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                    <MdOutlineChat className="w-5 h-5 text-gray-600" />
                </Button>

                {/* Microphone Button */}
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

                {/* Submit/Retake Buttons */}
                {recognizedText && !isListening && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-2"
                    >
                        <Button
                            onClick={onSubmitAnswer}
                            disabled={disabled}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200"
                        >
                            <FaCheck className="w-4 h-4 mr-2" />
                            {retakeCount > 0 ? "Submit" : "Submit"}
                        </Button>

                        {canRetake && retakeCount === 0 && (
                            <Button
                                onClick={onRetakeAnswer}
                                variant="outline"
                                disabled={disabled}
                                className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full shadow-lg transition-all duration-200"
                            >
                                <FaRedo className="w-4 h-4 mr-2" />
                                Retake
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Leave Interview */}
                <Button
                    onClick={onLeave}
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-200"
                >
                    <FaSignOutAlt className="w-5 h-5 text-red-600" />
                </Button>
            </div>
        </motion.div>
    );
} 