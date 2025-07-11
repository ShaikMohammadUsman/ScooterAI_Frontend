"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current CTC */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Current CTC (Base Salary)</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Your fixed monthly or annual base. We only show jobs that offer more.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Select
                            value={profile?.basic_information.current_ctc.cadence || "annual"}
                            onValueChange={(value) => onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, cadence: value })}
                        >
                            <SelectTrigger className="w-24 flex-1/2">
                                <SelectValue placeholder="Annual" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="annual">Annual</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={profile?.basic_information.current_ctc.currencyType || ""}
                            onValueChange={(value) => onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, currencyType: value })}
                        >
                            <SelectTrigger className="w-24 flex-1/2">
                                <SelectValue placeholder="₹" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INR">₹ (INR)</SelectItem>
                                <SelectItem value="USD">$ (USD)</SelectItem>
                                <SelectItem value="EUR">€ (EUR)</SelectItem>
                                <SelectItem value="GBP">£ (GBP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        type="number"
                        value={profile?.basic_information.current_ctc.value || ""}
                        onChange={e => onFieldChange("basic_information", "current_ctc", { ...profile?.basic_information.current_ctc, value: Number(e.target.value) })}
                        placeholder="Enter amount"
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Optional - Helps us match you with better-paying opportunities.
                </p>
            </FormControl>

            {/* Expected CTC (OTE) */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Expected CTC (OTE)</FormLabel>
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
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Select
                            value={profile?.basic_information.expected_ctc.cadence || "annual"}
                            onValueChange={(value) => onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, cadence: value })}
                        >
                            <SelectTrigger className="w-24 flex-1/2">
                                <SelectValue placeholder="Annual" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="annual">Annual</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={profile?.basic_information.expected_ctc.currencyType || ""}
                            onValueChange={(value) => onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, currencyType: value })}
                        >
                            <SelectTrigger className="w-24 flex-1/2">
                                <SelectValue placeholder="₹" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INR">₹ (INR)</SelectItem>
                                <SelectItem value="USD">$ (USD)</SelectItem>
                                <SelectItem value="EUR">€ (EUR)</SelectItem>
                                <SelectItem value="GBP">£ (GBP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        type="number"
                        value={profile?.basic_information.expected_ctc.value || ""}
                        onChange={e => onFieldChange("basic_information", "expected_ctc", { ...profile?.basic_information.expected_ctc, value: Number(e.target.value) })}
                        placeholder="Enter amount"
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Optional - Your expected total compensation including incentives.
                </p>
            </FormControl>
        </div>
    );
} 