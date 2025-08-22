import { motion } from "framer-motion";
import { FaMicrophone, FaGlobe, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/lib/interviewService";

interface AnimatedPlaceholderProps {
    onStart: (language: SupportedLanguageCode) => void;
    title: string;
    description: string;
    buttonText: string;
}

export function AnimatedPlaceholder({ onStart, title, description, buttonText }: AnimatedPlaceholderProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    const handleStart = () => {
        onStart(selectedLanguage);
    };

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

                    {/* Language Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Select Interview Language
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <FaGlobe className="text-gray-400" />
                                    <span className="text-gray-900">
                                        {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        ({SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.nativeName})
                                    </span>
                                </div>
                                <FaChevronDown className={`text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {SUPPORTED_LANGUAGES.map((language) => (
                                        <button
                                            key={language.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage(language.code);
                                                setShowLanguageDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${selectedLanguage === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{language.name}</span>
                                                    <span className="text-gray-500 text-sm">({language.nativeName})</span>
                                                </div>
                                                {selectedLanguage === language.code && (
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
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
