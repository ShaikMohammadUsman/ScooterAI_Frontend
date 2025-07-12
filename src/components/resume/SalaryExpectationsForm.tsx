"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Banknote, Calendar, TrendingUp } from "lucide-react";
import { ResumeProfile } from "@/lib/resumeService";

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
}

export default function SalaryExpectationsForm({ profile, onFieldChange }: SalaryExpectationsFormProps) {
    // Use the cadence and currencyType from current_ctc or expected_ctc, fallback to defaults
    const cadence = profile?.basic_information.current_ctc?.cadence || profile?.basic_information.expected_ctc?.cadence || "annual";
    const currencyType = profile?.basic_information.current_ctc?.currencyType || profile?.basic_information.expected_ctc?.currencyType || "INR";

    // Handlers to update both current_ctc and expected_ctc for cadence/currency
    const handleCadenceChange = (value: string) => {
        onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, cadence: value });
        onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, cadence: value });
    };
    const handleCurrencyChange = (value: string) => {
        onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, currencyType: value });
        onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, currencyType: value });
    };

    // Add state for error messages
    const [errors, setErrors] = useState<{ current?: string, expected?: string }>({});

    // Helper to allow only numbers (and optional decimal)
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'current' | 'expected') => {
        const value = e.target.value.replace(/[^\d.]/g, "");
        if (field === 'current') {
            onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, value });
        } else {
            onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, value });
        }
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    return (
        <div className="flex items-center justify-center p-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl relative overflow-hidden">
                {/* Subtle background icon */}
                <Banknote className="absolute right-6 top-6 w-24 h-24 text-blue-50 opacity-30 pointer-events-none z-0" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Quota and Currency Selection (spans both columns) */}
                    <div className="col-span-1 md:col-span-2 flex gap-4 mb-2">
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
                    {/* Current CTC */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><Banknote className="w-4 h-4 text-green-500" />Current CTC (Base Salary) <span className="text-red-500">*</span></FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Your fixed {cadence} base. We only show jobs that offer more.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="relative">
                            <Banknote className="absolute left-2 top-3 w-4 h-4 text-slate-300" />
                            <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9.]*"
                                required
                                value={profile?.basic_information.current_ctc.value ?? ""}
                                onChange={e => handleNumberInput(e, 'current')}
                                placeholder={`Enter ${cadence} amount`}
                                className="pl-8"
                            />
                        </div>
                        {errors.current && <p className="text-xs text-red-500 mt-1">{errors.current}</p>}
                    </FormControl>
                    {/* Expected CTC (OTE) */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><Banknote className="w-4 h-4 text-green-500" />Expected CTC (OTE) <span className="text-red-500">*</span></FormLabel>
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
                        <div className="relative">
                            <Banknote className="absolute left-2 top-3 w-4 h-4 text-slate-300" />
                            <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9.]*"
                                required
                                value={profile?.basic_information.expected_ctc.value ?? ""}
                                onChange={e => handleNumberInput(e, 'expected')}
                                placeholder={`Enter ${cadence} amount`}
                                className="pl-8"
                            />
                        </div>
                        {errors.expected && <p className="text-xs text-red-500 mt-1">{errors.expected}</p>}
                    </FormControl>
                </div>
            </div>
        </div>
    );
} 