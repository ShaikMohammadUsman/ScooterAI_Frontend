"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import { remindLater } from "@/lib/candidateService";
import { toast } from "@/hooks/use-toast";

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
}

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Success Modal Component
function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-bg-main rounded-2xl p-8 max-w-md mx-4 relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-green-600 hover:text-green-700 transition-colors"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>

                    {/* Content */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Your interaction has been scheduled.
                        </h3>
                        <p className="text-gray-600 mb-2">
                            We'll send you a whatsapp link to join the assessment.
                        </p>
                        <p className="text-gray-600">
                            Please note the link will only be active for the 36 hrs.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export function ScheduleInterviewModal({ isOpen, onClose, applicationId }: ScheduleInterviewModalProps) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [whatsappNumber, setWhatsappNumber] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Calendar generation
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Generate calendar days array
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
        calendarDays.push({ day: null, isPast: false, isToday: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isPast = day < currentDay;
        const isToday = day === currentDay;
        calendarDays.push({ day, isPast, isToday });
    }

    const handleDateSelect = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !whatsappNumber.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time into ISO string
            const dateTimeString = `${selectedDate}T${selectedTime}:00Z`;

            const response = await remindLater({
                application_id: applicationId,
                remaind_at: dateTimeString
            });

            if (response.status) {
                setShowSuccessModal(true);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to schedule assessment",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error scheduling assessment:", error);
            toast({
                title: "Error",
                description: error?.response?.data?.message || error?.message || "Failed to schedule assessment",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        onClose(); // Close the main modal as well
    };

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 flex items-center justify-center p-4"
                    style={{ background: 'var(--color-bg-main)' }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-2xl bg-bg-main rounded-2xl shadow-xl p-8"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Schedule your voice interaction according to your availability
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Pick Date Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                                Pick Date
                            </h3>

                            {/* Calendar */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {dayNames.map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map(({ day, isPast, isToday }, index) => {
                                        const isSelected = day && selectedDate && day.toString() === selectedDate.split('-')[2];

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (day && !isPast) {
                                                        handleDateSelect(day);
                                                    }
                                                }}
                                                disabled={!day || isPast}
                                                className={`
                                                    aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                                                    ${!day
                                                        ? 'cursor-default'
                                                        : isPast
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'text-white font-semibold'
                                                                : isToday
                                                                    ? 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-200'
                                                                    : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                                                    }
                                                `}
                                                style={isSelected ? { backgroundColor: 'var(--color-grad-1)' } : {}}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="mb-6">
                            <Label htmlFor="time" className="text-sm font-medium text-gray-700 mb-2 block">
                                Select Time
                            </Label>
                            <Input
                                id="time"
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* WhatsApp Number */}
                        <div className="mb-8">
                            <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 mb-2 block">
                                Whatsapp Number *
                            </Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                placeholder="ex: 99XXX XXX34"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                variant="primary"
                                className="px-8 py-3 text-lg font-semibold rounded-lg"
                            >
                                {isSubmitting ? "Scheduling..." : "Schedule Assessment"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
            />
        </>
    );
}
