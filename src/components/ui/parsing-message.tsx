import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";

const messages = [
    {
        text: "We're turning your resume into a structured profile...",
        icon: "✨",
        delay: 0
    },
    {
        text: "Analyzing your experience and skills...",
        icon: "🔍",
        delay: 1
    },
    {
        text: "Extracting key achievements and metrics...",
        icon: "📊",
        delay: 2
    },
    {
        text: "Just sit back, then do a quick review and submit",
        icon: "🎯",
        delay: 3
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2
        }
    }
};

const messageVariants = {
    hidden: {
        opacity: 0,
        y: 50,
        filter: "blur(10px)",
        scale: 0.8
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    exit: {
        opacity: 0,
        y: -50,
        filter: "blur(10px)",
        scale: 0.8,
        transition: {
            duration: 0.3
        }
    }
};

export function ParsingMessage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 4000); // Change message every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-2xl mx-auto relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-lg -z-10" />

            <Alert className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg relative overflow-hidden">
                {/* Animated background elements */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
                    animate={{
                        x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="flex-shrink-0"
                        >
                            <div className="relative">
                                <Loader2 className="h-6 w-6 text-primary" />
                                <motion.div
                                    className="absolute -inset-1 bg-primary/20 rounded-full blur-sm"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                        </motion.div>

                        <div className="flex-1 min-h-[120px] relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute inset-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <motion.span
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="text-2xl"
                                        >
                                            {messages[currentIndex].icon}
                                        </motion.span>
                                        <AlertDescription className="text-base font-medium text-gray-700">
                                            {messages[currentIndex].text}
                                        </AlertDescription>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-4 flex gap-1">
                        {messages.map((_, index) => (
                            <div
                                key={index}
                                className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className={`h-full ${currentIndex === index ? "bg-primary" : "bg-gray-200"
                                        }`}
                                    initial={{ width: "0%" }}
                                    animate={{
                                        width: currentIndex === index ? "100%" : "0%"
                                    }}
                                    transition={{
                                        duration: 4,
                                        ease: "linear"
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Alert>
        </motion.div>
    );
} 