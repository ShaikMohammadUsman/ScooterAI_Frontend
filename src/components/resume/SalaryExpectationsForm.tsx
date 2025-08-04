"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, TrendingUp, Sparkles, Target, Trophy } from "lucide-react";
import { Banknote, Calendar, TrendingUp as TrendingUpIcon } from "lucide-react";
import { ResumeProfile } from "@/lib/resumeService";
import { Slider } from "@/components/ui/slider";

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface SalaryExpectationsFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    parsedUserName?: string;
}

export default function SalaryExpectationsForm({ profile, onFieldChange, parsedUserName }: SalaryExpectationsFormProps) {
    // Use the cadence and currencyType from current_ctc or expected_ctc, fallback to defaults
    const cadence = profile?.basic_information.current_ctc?.cadence || profile?.basic_information.expected_ctc?.cadence || "annual";
    const currencyType = profile?.basic_information.current_ctc?.currencyType || profile?.basic_information.expected_ctc?.currencyType || "INR";

    // Get user's name for personalization
    const userName = parsedUserName || profile?.basic_information?.full_name || "there";
    const firstName = userName.split(' ')[0];

    // State for motivational quotes
    const [currentQuote, setCurrentQuote] = useState("");
    const [expectedQuote, setExpectedQuote] = useState("");

    // Salary ranges based on currency
    const getSalaryRange = () => {
        switch (currencyType) {
            case "USD":
                return { min: 0, max: 300000, step: 5000 };
            case "EUR":
                return { min: 0, max: 250000, step: 5000 };
            case "GBP":
                return { min: 0, max: 200000, step: 5000 };
            default: // INR
                return { min: 0, max: 20000000, step: 50000 };
        }
    };

    const salaryRange = getSalaryRange();

    // Get current and expected values
    const currentValue = profile?.basic_information.current_ctc?.value || 0;
    const expectedValue = profile?.basic_information.expected_ctc?.value || salaryRange.min;

    // Format Indian numbers (lakhs/crores)
    const formatIndianNumber = (value: number) => {
        if (value === 0) return "0";

        if (value >= 10000000) {
            return (value / 10000000).toFixed(1) + " Cr";
        } else if (value >= 100000) {
            return (value / 100000).toFixed(1) + " L";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
        }
        return value.toString();
    };

    // Format currency display with Indian formatting
    const formatCurrency = (value: number) => {
        if (currencyType === "INR") {
            return `₹${formatIndianNumber(value)}`;
        }

        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyType,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formatter.format(value);
    };

    // Motivational quotes based on salary choices
    const getMotivationalQuote = (type: 'current' | 'expected', value: number) => {
        const quotes = {
            current: [
                "Great starting point! 💪",
                "Solid foundation to build upon! 🚀",
                "Every expert was once a beginner! 🌟",
                "You're on the right track! 🎯",
                "Fresh start, unlimited potential! ✨"
            ],
            expected: [
                "Ambitious goals lead to amazing results! 🎯",
                "That's a nice increment you're aiming for! 📈",
                "Dream big, achieve bigger! ⭐",
                "Your confidence is inspiring! 💫",
                "That's a smart career move! 🧠",
                "You know your worth! 💎"
            ]
        };

        const typeQuotes = quotes[type];
        const index = Math.floor((value - salaryRange.min) / (salaryRange.max - salaryRange.min) * typeQuotes.length);
        return typeQuotes[Math.min(index, typeQuotes.length - 1)];
    };

    // Update quotes when values change
    useEffect(() => {
        setCurrentQuote(getMotivationalQuote('current', currentValue));
        setExpectedQuote(getMotivationalQuote('expected', expectedValue));
    }, [currentValue, expectedValue]);

    // Handlers to update both current_ctc and expected_ctc for cadence/currency
    const handleCadenceChange = (value: string) => {
        onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, cadence: value });
        onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, cadence: value });
    };
    const handleCurrencyChange = (value: string) => {
        onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, currencyType: value });
        onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, currencyType: value });
    };

    // Handle slider changes for current salary
    const handleCurrentSalaryChange = (value: number[]) => {
        onFieldChange("basic_information", "current_ctc", {
            ...profile?.basic_information.current_ctc,
            value: value[0]
        });
    };

    // Handle slider changes for expected salary
    const handleExpectedSalaryChange = (value: number[]) => {
        onFieldChange("basic_information", "expected_ctc", {
            ...profile?.basic_information.expected_ctc,
            value: value[0]
        });
    };

    return (
        <div className="flex items-center justify-center p-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-4xl relative overflow-hidden">
                {/* Subtle background icon */}
                <Banknote className="absolute right-6 top-6 w-24 h-24 text-blue-50 opacity-30 pointer-events-none z-0" />

                {/* Personalized Header */}
                <div className="text-center mb-6 relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Target className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Let's talk numbers, {firstName}! 💰
                        </h2>
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-gray-600 text-sm">
                        Set your salary expectations to match with the right opportunities
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                    {/* Quota and Currency Selection */}
                    <div className="flex gap-4 mb-4">
                        <FormControl>
                            <FormLabel className="flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-400" />Salary Quota</FormLabel>
                            <Select value={cadence} onValueChange={handleCadenceChange}>
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Annual" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel className="flex items-center gap-1"><Banknote className="w-4 h-4 text-green-500" />Currency</FormLabel>
                            <Select value={currencyType} onValueChange={handleCurrencyChange}>
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="₹ (INR)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">₹ (INR)</SelectItem>
                                    <SelectItem value="USD">$ (USD)</SelectItem>
                                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                                    <SelectItem value="GBP">£ (GBP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </div>

                    {/* Combined Salary Slider */}
                    <div className="space-y-6">
                        {/* Current CTC */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FormLabel className="flex items-center gap-1">
                                    <Banknote className="w-4 h-4 text-green-500" />
                                    Current CTC (Base Salary)
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Your fixed {cadence} base. Can be 0 for freshers.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Slider */}
                            <div className="px-2">
                                <Slider
                                    value={[currentValue]}
                                    onValueChange={handleCurrentSalaryChange}
                                    min={salaryRange.min}
                                    max={salaryRange.max}
                                    step={salaryRange.step}
                                    className="w-full"
                                />
                            </div>

                            {/* Display value */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {currentValue === 0 ? "Fresher (₹0)" : formatCurrency(currentValue)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {cadence === 'annual' ? 'per year' : 'per month'}
                                </div>
                            </div>

                            {/* Motivational quote */}
                            {currentQuote && (
                                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-700">
                                            {currentQuote}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expected CTC */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FormLabel className="flex items-center gap-1">
                                    <Banknote className="w-4 h-4 text-green-500" />
                                    Expected CTC (OTE)
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add your expected total compensation including incentives.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Slider */}
                            <div className="px-2">
                                <Slider
                                    value={[expectedValue]}
                                    onValueChange={handleExpectedSalaryChange}
                                    min={Math.max(salaryRange.min, currentValue)}
                                    max={salaryRange.max}
                                    step={salaryRange.step}
                                    className="w-full"
                                />
                            </div>

                            {/* Display value */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(expectedValue)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {cadence === 'annual' ? 'per year' : 'per month'}
                                </div>
                            </div>

                            {/* Motivational quote */}
                            {expectedQuote && (
                                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUpIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-700">
                                            {expectedQuote}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Increment Display */}
                        {expectedValue > currentValue && currentValue > 0 && (
                            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-700">
                                        You're aiming for a {((expectedValue - currentValue) / currentValue * 100).toFixed(1)}% increase!
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    That's a smart career move! 🚀
                                </p>
                            </div>
                        )}

                        {/* Special message for freshers */}
                        {currentValue === 0 && expectedValue > 0 && (
                            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-purple-700">
                                        Starting your career journey! 🎯
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Great expectations for your first role! 💫
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 