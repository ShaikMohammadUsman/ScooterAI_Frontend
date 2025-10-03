import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaQuestion, FaInfoCircle } from 'react-icons/fa';
import { MdOutlineAssignment } from 'react-icons/md';

interface QuestionPaletteProps {
    messages: {
        own: boolean;
        text: string;
        icon: React.ReactNode;
        status?: 'completed' | 'retaken';
        loading?: boolean;
        isIntroduction?: boolean;
    }[];
    currentQuestionIndex?: number;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ messages, currentQuestionIndex = 0 }) => {
    // Filter out user messages, keep both introduction and interview questions
    const allAiMessages = messages.filter(msg => !msg.own);

    // Debug logging
    console.log('QuestionPalette Debug:', {
        totalMessages: messages.length,
        allAiMessages: allAiMessages.length,
        currentQuestionIndex,
        messages: messages.map(m => ({
            own: m.own,
            text: m.text.substring(0, 50),
            status: m.status,
            isIntroduction: m.isIntroduction
        }))
    });

    // Don't render if no AI messages at all
    if (allAiMessages.length === 0) {
        console.log('QuestionPalette: No AI messages found, not rendering');
        return null;
    }

    return (
        <>
            {/* Desktop - Vertical on left side */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50 p-2"
            >
                <div className="flex flex-col gap-3">
                    {allAiMessages.map((message, index) => {
                        // For current question index, we need to account for introduction messages
                        // If there's an introduction, actual questions start from index 1
                        const actualQuestionIndex = message.isIntroduction ? -1 :
                            (allAiMessages.filter((_, i) => i <= index && !allAiMessages[i].isIntroduction).length - 1);

                        const isCurrent = actualQuestionIndex === currentQuestionIndex;
                        const isCompleted = message.status === 'completed';

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
                                ) : message.isIntroduction ? (
                                    <FaInfoCircle className="w-5 h-5" />
                                ) : (
                                    `Q${actualQuestionIndex + 1}`
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
                className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-50 p-2"
            >
                <div className="flex gap-2 backdrop-blur-md rounded-lg p-2">
                    {allAiMessages.map((message, index) => {
                        // For current question index, we need to account for introduction messages
                        // If there's an introduction, actual questions start from index 1
                        const actualQuestionIndex = message.isIntroduction ? -1 :
                            (allAiMessages.filter((_, i) => i <= index && !allAiMessages[i].isIntroduction).length - 1);

                        const isCurrent = actualQuestionIndex === currentQuestionIndex;
                        const isCompleted = message.status === 'completed';

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
                                ) : message.isIntroduction ? (
                                    <FaInfoCircle className="w-4 h-4" />
                                ) : (
                                    `Q${actualQuestionIndex + 1}`
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
};

export default QuestionPalette; 