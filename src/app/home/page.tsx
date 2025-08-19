"use client"
import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import SupportTicketForm from '@/components/SupportTicketForm'
// const SupportTicketForm = dynamic(() => import('@/components/SupportTicketForm'), { ssr: false })
import { FaRocket, FaBriefcase, FaHandshake } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background flex flex-col mt-20 sm:mt-auto">

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-background">
                <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 p-6 shadow-lg mb-6"
                >
                    <img src="/assets/images/scooterLogo.png" alt="Scooter Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
                </motion.span>
                <motion.h1
                    initial={{ opacity: 1, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-4xl sm:text-5xl font-extrabold text-center text-foreground mb-6 tracking-tight"
                >
                    Begin Your Journey at <span className="text-primary">Scooter</span>
                </motion.h1>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.14 } },
                    }}
                    className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="flex-1 bg-gradient-to-tr from-gray-800 to-gray-600 rounded-2xl shadow-xl p-6 flex items-center gap-4 border border-blue-200 min-w-[220px]"
                    >
                        <FaBriefcase size={56} className="text-white drop-shadow-lg" />
                        <span className="text-lg sm:text-xl text-white font-semibold">Find verified, high-growth opportunities across industries.</span>
                    </motion.div>
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="flex-1 bg-gradient-to-tr from-gray-800 to-gray-600 rounded-2xl shadow-xl p-6 flex items-center gap-4 border border-green-200 min-w-[220px]"
                    >
                        <FaHandshake size={84} className="text-white drop-shadow-lg" />
                        <span className="text-base sm:text-lg text-white font-semibold">Apply once, showcase your skills, and get matched to roles where you'll thrive.</span>
                    </motion.div>
                </motion.div>
                <div className="mt-10 flex justify-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-gradient-to-r from-gray-800 via-gray-500 to-gray-600 text-white font-semibold shadow-xl border border-blue-200 hover:from-gray-700 hover:via-gray-500 hover:to-gray-500 transition-colors"
                                size="lg"
                            >
                                Have a query? Contact Support
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gradient-to-tr from-gray-50 to-gray-200 border-blue-200">
                            <DialogTitle className="text-gray-900 font-bold mb-2">
                                Submit a support ticket
                            </DialogTitle>
                            <SupportTicketForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </main>


        </div>
    )
}