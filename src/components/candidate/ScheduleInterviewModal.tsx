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
                className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-xl bg-opacity-50 p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-bg-main rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 relative my-4"
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
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                            Your interaction has been scheduled.
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-2">
                            We'll send you a whatsapp link to join the interaction.
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">
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
        const isPast = day < currentDay; // Past days (before today)
        const isToday = day === currentDay; // Today
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
                    description: response.message || "Failed to schedule interaction",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error scheduling interaction:", error);
            toast({
                title: "Error",
                description: error?.response?.data?.message || error?.message || "Failed to schedule interaction",
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
                    className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 overflow-y-auto scrollbar-thin"
                    style={{ background: 'var(--color-bg-main)' }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-2xl bg-bg-main rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 my-4 max-h-[90vh] overflow-y-auto scrollbar-thin"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 sm:mb-6 lg:mb-8 gap-4">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
                                Schedule your voice interaction according to your availability
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-1"
                            >
                                <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Pick Date Section */}
                        <div className="mb-4 sm:mb-6 lg:mb-8">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 text-center">
                                Pick Date
                            </h3>

                            {/* Calendar */}
                            <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 lg:p-4 max-w-sm sm:max-w-md mx-auto">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                                    {dayNames.map((day) => (
                                        <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                                                    aspect-square flex items-center justify-center text-xs sm:text-sm rounded-md sm:rounded-lg transition-colors min-h-[32px] sm:min-h-[36px]
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
                        <div className="mb-4 sm:mb-6">
                            <Label className="text-sm font-medium text-gray-700 mb-3 block text-center">
                                Select Time
                            </Label>

                            {/* Custom Time Picker */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Hour Selection */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-2 block text-center">Hour</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const hour = i.toString().padStart(2, '0');
                                                const isSelected = selectedTime && selectedTime.split(':')[0] === hour;
                                                return (
                                                    <button
                                                        key={hour}
                                                        onClick={() => {
                                                            const currentMinute = selectedTime ? selectedTime.split(':')[1] || '00' : '00';
                                                            setSelectedTime(`${hour}:${currentMinute}`);
                                                        }}
                                                        className={`
                                                            text-xs py-2 px-1 rounded-md transition-colors
                                                            ${isSelected
                                                                ? 'bg-orange-500 text-white font-semibold'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }
                                                        `}
                                                    >
                                                        {hour}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Minute Selection */}
                                    <div>
                                        <label className="text-xs text-gray-500 mb-2 block text-center">Minute</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {[0, 15, 30, 45].map((minute) => {
                                                const minuteStr = minute.toString().padStart(2, '0');
                                                const isSelected = selectedTime && selectedTime.split(':')[1] === minuteStr;
                                                return (
                                                    <button
                                                        key={minuteStr}
                                                        onClick={() => {
                                                            const currentHour = selectedTime ? selectedTime.split(':')[0] || '09' : '09';
                                                            setSelectedTime(`${currentHour}:${minuteStr}`);
                                                        }}
                                                        className={`
                                                            text-xs py-2 px-1 rounded-md transition-colors
                                                            ${isSelected
                                                                ? 'bg-orange-500 text-white font-semibold'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }
                                                        `}
                                                    >
                                                        {minuteStr}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Time Display */}
                                {selectedTime && (
                                    <div className="mt-4 text-center">
                                        <div className="text-lg font-semibold text-orange-600">
                                            {selectedTime}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Selected time
                                        </div>
                                    </div>
                                )}

                                {/* Quick Time Buttons */}
                                <div className="mt-4">
                                    <label className="text-xs text-gray-500 mb-2 block text-center">Quick Select</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: '9:00 AM', value: '09:00' },
                                            { label: '2:00 PM', value: '14:00' },
                                            { label: '6:00 PM', value: '18:00' },
                                            { label: '8:00 PM', value: '20:00' }
                                        ].map((time) => (
                                            <button
                                                key={time.value}
                                                onClick={() => setSelectedTime(time.value)}
                                                className={`
                                                    text-xs py-2 px-3 rounded-md transition-colors
                                                    ${selectedTime === time.value
                                                        ? 'bg-orange-500 text-white font-semibold'
                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                    }
                                                `}
                                            >
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Number */}
                        <div className="mb-6 sm:mb-8">
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
                                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold"
                            >
                                {isSubmitting ? "Scheduling..." : "Schedule"}
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
