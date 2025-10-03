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
    currentQuestionIndex?: number;
}

export function GeneralQuestionPalette({ messages, currentQuestionIndex = 0 }: GeneralQuestionPaletteProps) {
    // Filter to get only AI questions (non-own messages)
    const aiQuestions = messages.filter(msg => !msg.own);

    if (aiQuestions.length === 0) {
        return null;
    }

    return (
        <>
            {/* Desktop - Vertical on left side */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block fixed left-4 top-1/2 transform -translate-y-1/2 z-30"
            >
                <div className="flex flex-col gap-3">
                    {aiQuestions.map((question, index) => {
                        const isCurrent = index === currentQuestionIndex;
                        const isCompleted = question.status === 'completed';

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all
                                    ${isCurrent
                                        ? 'text-white' // Gradient background applied via style
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-element-3 text-gray-700'
                                    }
                                `}
                                style={isCurrent ? {
                                    background: 'linear-gradient(90deg, var(--color-grad-1), var(--color-grad-2))'
                                } : {}}
                            >
                                {isCompleted ? (
                                    <FaCheck className="w-5 h-5" />
                                ) : (
                                    `Q${index + 1}`
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Mobile - Horizontal at top */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
            >
                <div className="flex gap-2 backdrop-blur-md rounded-lg p-2">
                    {aiQuestions.map((question, index) => {
                        const isCurrent = index === currentQuestionIndex;
                        const isCompleted = question.status === 'completed';

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all
                                    ${isCurrent
                                        ? 'text-white' // Gradient background applied via style
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-element-3 text-gray-700'
                                    }
                                `}
                                style={isCurrent ? {
                                    background: 'linear-gradient(90deg, var(--color-grad-1), var(--color-grad-2))'
                                } : {}}
                            >
                                {isCompleted ? (
                                    <FaCheck className="w-4 h-4" />
                                ) : (
                                    `Q${index + 1}`
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
} 