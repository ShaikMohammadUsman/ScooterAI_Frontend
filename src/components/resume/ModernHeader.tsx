"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FiUploadCloud, FiTrendingUp, FiTarget, FiUsers, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";

interface ModernHeaderProps {
    title: string;
    description: string;
}

export default function ModernHeader({ title, description }: ModernHeaderProps) {
    return (
        <Card className="relative w-full max-w-lg mx-auto shadow-lg border-0 rounded-3xl bg-white/95 backdrop-blur-sm overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

            {/* Animated Icons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <FiTrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <FiTarget className="w-4 h-4 text-purple-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-green-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <FiZap className="w-4 h-4 text-orange-500" />
                    </div>
                </motion.div>
            </div>

            <CardHeader className="relative flex flex-col items-center gap-3 bg-white/80 px-8 py-6 rounded-3xl">
                {/* Main Icon */}
                <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="relative"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <FiUploadCloud className="text-white w-8 h-8" />
                    </div>
                    {/* Pulse effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                    <CardTitle className="text-4xl font-bold mb-2 text-center">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            {title}
                        </span>
                    </CardTitle>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                    <CardDescription className="text-center text-lg max-w-md text-gray-600">
                        {description}
                    </CardDescription>
                </motion.div>

                {/* Progress indicator dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-2 mt-4"
                >
                    {[1, 2, 3].map((dot) => (
                        <motion.div
                            key={dot}
                            className="w-2 h-2 bg-blue-500/30 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ delay: 0.8 + dot * 0.1, duration: 1, repeat: Infinity }}
                        />
                    ))}
                </motion.div>
            </CardHeader>
        </Card>
    );
} 