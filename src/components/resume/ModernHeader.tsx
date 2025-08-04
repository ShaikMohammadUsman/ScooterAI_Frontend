"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FiUploadCloud, FiTrendingUp, FiTarget, FiUsers, FiZap, FiStar, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";

interface ModernHeaderProps {
    title: string;
    description: string;
}

export default function ModernHeader({ title, description }: ModernHeaderProps) {
    return (
        <Card className="relative w-full max-w-2xl mx-auto shadow-2xl border-0 rounded-3xl bg-white overflow-hidden">



            {/* Branding Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Image
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter AI"
                        width={48}
                        height={48}
                        className="rounded-lg shadow-lg"
                    />
                    <div className="text-white">
                        <h1 className="text-2xl font-bold">Scooter AI</h1>
                        <p className="text-blue-100 text-sm">Intelligent Hiring Platform</p>
                    </div>
                </div>

                {/* Decorative elements in header */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                        <FiStar className="w-5 h-5 text-yellow-300" />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <FiAward className="w-5 h-5 text-yellow-300" />
                    </motion.div>
                </div>
            </div>

            {/* Animated Icons */}
            <div className="absolute top-20 right-6 flex gap-2 z-10">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-200">
                        <FiTrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-200">
                        <FiTarget className="w-5 h-5 text-purple-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-200">
                        <FiUsers className="w-5 h-5 text-green-500" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                    <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-200">
                        <FiZap className="w-5 h-5 text-orange-500" />
                    </div>
                </motion.div>
            </div>

            <CardHeader className="relative flex flex-col items-center gap-4 bg-white px-8 py-8 rounded-3xl">
                {/* Main Icon with enhanced styling */}
                <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="relative"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                        <FiUploadCloud className="text-white w-10 h-10" />
                    </div>
                    {/* Enhanced pulse effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-10"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    />
                </motion.div>

                {/* Title with enhanced styling */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                    <CardTitle className="text-5xl font-bold mb-3 text-center">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {title}
                        </span>
                    </CardTitle>
                </motion.div>

                {/* Description with enhanced styling */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                    <CardDescription className="text-center text-lg max-w-lg text-gray-600 leading-relaxed">
                        {description}
                    </CardDescription>
                </motion.div>

                {/* Enhanced progress indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-3 mt-6"
                >
                    {[1, 2, 3].map((dot) => (
                        <motion.div
                            key={dot}
                            className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ delay: 0.8 + dot * 0.1, duration: 1.5, repeat: Infinity }}
                        />
                    ))}
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Fast</span>
                    </div>
                </motion.div>
            </CardHeader>
        </Card>
    );
} 