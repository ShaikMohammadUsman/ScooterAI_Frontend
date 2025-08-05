import { motion } from "framer-motion";
import { FaCheck, FaQuestion, FaInfoCircle } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

interface Message {
    own: boolean;
    text: string;
    icon: React.ReactNode;
    status?: 'completed' | 'retaken';
}

interface GeneralQuestionPaletteProps {
    messages: Message[];
}

export function GeneralQuestionPalette({ messages }: GeneralQuestionPaletteProps) {
    // Filter to get only AI questions (non-own messages)
    const aiQuestions = messages.filter(msg => !msg.own);

    if (aiQuestions.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30"
        >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="flex flex-col gap-3">
                    {aiQuestions.map((question, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {/* Question Number or Icon */}
                            <div className="flex-shrink-0">
                                {question.status === 'completed' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                                    >
                                        <FaCheck className="w-4 h-4 text-green-600" />
                                    </motion.div>
                                ) : (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaQuestion className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                            </div>

                            {/* Question Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800">
                                    Q{index + 1}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {question.status === 'completed' ? 'Answered' : 'Pending'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
} 