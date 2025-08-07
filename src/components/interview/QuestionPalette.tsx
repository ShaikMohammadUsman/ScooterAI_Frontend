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
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({ messages }) => {
    // Filter out user messages and only show AI questions
    const aiQuestions = messages.filter(msg => !msg.own);

    // Don't render if no AI questions
    if (aiQuestions.length === 0) {
        return null;
    }

    return (
        <div className="md:block fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
            <div className="flex flex-col items-center gap-3">
                <AnimatePresence>
                    {aiQuestions.map((question, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: -20 }}
                            className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${question.status
                                ? 'bg-green-600 border-green-500 text-white'
                                : question.isIntroduction
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {question.status ? (
                                // Answered - show checkmark
                                <FaCheck className="w-5 h-5" />
                            ) : question.isIntroduction ? (
                                // Introduction/Test question - show info icon
                                <FaInfoCircle className="w-5 h-5" />
                            ) : (
                                // Regular question - show question number
                                <span className="text-sm font-semibold">{index}</span>
                            )}

                            {/* Question number tooltip for answered questions */}
                            {question.status && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Q{index}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuestionPalette; 