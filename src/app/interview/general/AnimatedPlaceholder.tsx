import { motion } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";

interface AnimatedPlaceholderProps {
    onStart: () => void;
    title: string;
    description: string;
    buttonText: string;
}

export function AnimatedPlaceholder({ onStart, title, description, buttonText }: AnimatedPlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen relative overflow-hidden text-center px-6">
            {/* Animated Gradient Blob */}
            <div className="absolute -top-20 -left-20 w-full h-full bg-gradient-to-r from-indigo-300 via-blue-300 to-purple-300 opacity-30 rounded-full filter blur-3xl animate-pulse"></div>

            {/* Motion Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center"
            >
                <motion.div
                    animate={{
                        y: [0, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="text-indigo-600 bg-white/80 p-6 rounded-2xl shadow-lg border border-indigo-100 backdrop-blur-md"
                >
                    <div className="text-2xl font-semibold mb-2">{title}</div>
                    <div className="text-sm text-muted-foreground mb-6">
                        {description}
                    </div>
                    <button
                        onClick={onStart}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                        <FaMicrophone />
                        {buttonText}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
