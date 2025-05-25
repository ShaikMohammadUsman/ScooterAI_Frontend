"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaUsers, FaChartLine, FaRocket, FaArrowRight } from 'react-icons/fa';
import CompanyAuth from './(auth)/page';

export default function CompanyPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        // console.log(companyId);
        if (companyId) {
            setIsAuthenticated(true);
        }
    }, []);


    return (
        <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className={`max-w-6xl mx-auto gap-12 items-center ${isAuthenticated ? 'flex-1' : 'grid grid-cols-1 lg:grid-cols-2 '}`}>
                    {/* Left Content */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Transform Your Hiring Process with AI
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Streamline your recruitment, find the best talent, and make data-driven hiring decisions.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <FaBuilding className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Smart Recruitment</h3>
                                <p className="text-gray-600">AI-powered candidate screening and matching</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <FaUsers className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Talent Pool</h3>
                                <p className="text-gray-600">Access to a diverse pool of qualified candidates</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <FaChartLine className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                                <p className="text-gray-600">Data-driven insights for better hiring decisions</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="bg-white p-6 rounded-lg shadow-sm"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <FaRocket className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
                                <p className="text-gray-600">Get started in minutes, not days</p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-indigo-50 p-6 rounded-lg"
                        >
                            <h3 className="text-lg font-semibold mb-2">Why Choose Us?</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <FaArrowRight className="h-4 w-4 text-indigo-600" />
                                    <span>AI-powered candidate matching</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaArrowRight className="h-4 w-4 text-indigo-600" />
                                    <span>Automated screening process</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaArrowRight className="h-4 w-4 text-indigo-600" />
                                    <span>Comprehensive analytics dashboard</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaArrowRight className="h-4 w-4 text-indigo-600" />
                                    <span>Dedicated support team</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Right Content - Auth Forms */}
                    {!isAuthenticated && (
                        <CompanyAuth />
                    )}
                </div>
            </div>
        </div>
    );
} 