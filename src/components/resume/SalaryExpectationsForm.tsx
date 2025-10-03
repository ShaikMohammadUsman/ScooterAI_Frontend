"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, TrendingUp, Sparkles, Target, Trophy } from "lucide-react";
import { Banknote, Calendar, TrendingUp as TrendingUpIcon } from "lucide-react";
import { ResumeProfile } from "@/lib/resumeService";
import { Slider } from "@/components/ui/slider";
import ErrorMessage from "@/components/ui/error-message";

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
    salaryError?: string; // Add prop for salary error
}

export default function SalaryExpectationsForm({ profile, onFieldChange, parsedUserName, salaryError }: SalaryExpectationsFormProps) {
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

    // Format currency for tooltip display (with commas)
    const formatCurrencyTooltip = (value: number) => {
        if (currencyType === "INR") {
            return `₹${value.toLocaleString('en-IN')}`;
        }
        return formatCurrency(value);
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
            <div className="bg-bg-main rounded-xl border border-gray-100 p-6 w-full max-w-4xl relative overflow-hidden">
                {/* Subtle background icon */}
                <Banknote className="absolute right-6 top-6 w-24 h-24 text-blue-50 opacity-30 pointer-events-none z-0" />

                {/* Error Message Display */}
                {salaryError && (
                    <ErrorMessage message={salaryError} />
                )}

                {/* Personalized Header */}
                <div className="text-center mb-6 relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {/* <Target className="w-6 h-6 text-blue-500" /> */}
                        <h2 className="text-2xl font-bold text-gray-800">
                            Let's talk numbers, {firstName}!
                        </h2>
                        {/* <Trophy className="w-6 h-6 text-yellow-500" /> */}
                    </div>
                    <p className="text-gray-600 text-sm">
                        Set your salary expectations to match with the right opportunities
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                    {/* Quota and Currency Selection */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <FormControl>
                            <FormLabel className="flex items-center justify-center gap-1">Salary Quota</FormLabel>
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
                            <FormLabel className="flex items-center justify-center gap-1">Currency</FormLabel>
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

                            {/* Slider with range indicators and tooltip */}
                            <div className="relative px-2">
                                {/* Range indicators */}
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>{formatCurrencyTooltip(salaryRange.min)}</span>
                                    <span>{formatCurrencyTooltip(salaryRange.max)}</span>
                                </div>

                                {/* Custom slider container */}
                                <div className="relative">
                                    <Slider
                                        value={[currentValue]}
                                        onValueChange={handleCurrentSalaryChange}
                                        min={salaryRange.min}
                                        max={salaryRange.max}
                                        step={salaryRange.step}
                                        className="w-full"
                                        trackColor="#FFBFA9"
                                        rangeColor="#FC8861"
                                        thumbColor="#FC8861"
                                        thumbBorderColor="#fb923c"
                                    />

                                    {/* Tooltip on slider handle */}
                                    <div
                                        className="absolute top-[-40px] transform -translate-x-1/2 pointer-events-none"
                                        style={{ left: `${((currentValue - salaryRange.min) / (salaryRange.max - salaryRange.min)) * 100}%` }}
                                    >
                                        <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                            {formatCurrencyTooltip(currentValue)}
                                        </div>
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600 mx-auto"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Display value */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {currentValue === 0 ? "Fresher (₹0)" : formatCurrency(currentValue)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {cadence === 'annual' ? 'per year' : 'per month'}
                                </div>
                            </div>

                            {/* Motivational quote */}
                            {currentQuote && (
                                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium text-orange-700">
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

                            {/* Slider with range indicators and tooltip */}
                            <div className="relative px-2">
                                {/* Range indicators */}
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>{formatCurrencyTooltip(Math.max(salaryRange.min, currentValue))}</span>
                                    <span>{formatCurrencyTooltip(salaryRange.max)}</span>
                                </div>

                                {/* Custom slider container */}
                                <div className="relative">
                                    <Slider
                                        value={[expectedValue]}
                                        onValueChange={handleExpectedSalaryChange}
                                        min={Math.max(salaryRange.min, currentValue)}
                                        max={salaryRange.max}
                                        step={salaryRange.step}
                                        className="w-full"
                                        trackColor="#E8FF89"
                                        rangeColor="#BADD26"
                                        thumbColor="#BADD26"
                                        thumbBorderColor="#84cc16"
                                    />

                                    {/* Tooltip on slider handle */}
                                    <div
                                        className="absolute top-[-40px] transform -translate-x-1/2 pointer-events-none"
                                        style={{ left: `${((expectedValue - Math.max(salaryRange.min, currentValue)) / (salaryRange.max - Math.max(salaryRange.min, currentValue))) * 100}%` }}
                                    >
                                        <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                            {formatCurrencyTooltip(expectedValue)}
                                        </div>
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600 mx-auto"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Display value */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-lime-600">
                                    {formatCurrency(expectedValue)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {cadence === 'annual' ? 'per year' : 'per month'}
                                </div>
                            </div>

                            {/* Motivational quote */}
                            {expectedQuote && (
                                <div className="text-center p-3 bg-lime-50 rounded-lg border border-lime-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUpIcon className="w-4 h-4 text-lime-500" />
                                        <span className="text-sm font-medium text-lime-700">
                                            {expectedQuote}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Increment Display */}
                        {expectedValue > currentValue && currentValue > 0 && (
                            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-lime-50 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                    <span className="font-semibold text-orange-700">
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