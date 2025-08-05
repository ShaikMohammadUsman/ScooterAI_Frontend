import React from 'react';
import { Button } from '@/components/ui/button';
import { MdOutlineChat, MdClose } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { LoadingDots } from '@/components/ui/loadingDots';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    messages: { own: boolean; text: string; icon: React.ReactNode; status?: 'completed' | 'retaken'; loading?: boolean; isIntroduction?: boolean }[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onToggle, messages }) => {
    return (
        <>
            {/* Chat Toggle Button - Fixed position */}
            <Button
                variant="ghost"
                size="icon"
                className={`fixed top-4 right-4 z-40 w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                onClick={onToggle}
            >
                <MdOutlineChat className="w-5 h-5" />
            </Button>

            {/* Chat Panel - Slides in from right */}
            <div className={`fixed top-20 right-0 h-[calc(100vh-4rem)] w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 shadow-2xl transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
                    <h3 className="text-lg font-semibold text-white">Chat</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
                        onClick={onToggle}
                    >
                        <MdClose className="w-4 h-4" />
                    </Button>
                </div>

                {/* Chat Content */}
                <div className="h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
                    <div className="p-6 space-y-2">
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex items-start gap-3 mb-3 justify-start"
                                >
                                    {!msg.own && <div className="flex-shrink-0">{msg.icon}</div>}
                                    <div className="rounded-2xl flex flex-row max-w-[80%] relative shadow-sm backdrop-blur-sm bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white border border-gray-600">
                                        {msg.loading ? (
                                            <div className="min-w-[100px]">
                                                <LoadingDots bg="gray-400" />
                                            </div>
                                        ) : (
                                            !msg.own && (<p className="text-sm p-2">{msg.text}</p>)
                                        )}
                                        {msg.status && msg.own && (
                                            <div className="float-right flex flex-row items-center gap-2 p-1 rounded-md bg-green-600">
                                                <FaCheck className="text-green-300" size={10} />
                                                <span className="text-[10px] text-white">
                                                    Answered
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <p className="text-sm">No messages yet. Start the interview to begin the conversation.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop - Only show on mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onToggle}
            />
        </>
    );
};

export default ChatPanel; 