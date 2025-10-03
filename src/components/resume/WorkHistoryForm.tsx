"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, X, Briefcase } from "lucide-react";
import { CompanyHistory, ResumeProfile } from "@/lib/resumeService";
import dayjs from "dayjs";
import ErrorMessage from "@/components/ui/error-message";

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface WorkHistoryFormProps {
    profile: ResumeProfile;
    onCompanyHistoryChange: (index: number, field: keyof CompanyHistory, value: any) => void;
    onAddCompanyHistory: () => void;
    onRemoveCompanyHistory: (index: number) => void;
    forceExpandIndex?: number | null;
    workError?: string; // Add prop for work error
    workInvalidIndex?: number | null; // Add prop for invalid work index
}

export default function WorkHistoryForm({
    profile,
    onCompanyHistoryChange,
    onAddCompanyHistory,
    onRemoveCompanyHistory,
    forceExpandIndex,
    workError,
    workInvalidIndex
}: WorkHistoryFormProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const count = useRef(-1)
    // Auto-expand the last company when a new one is added

    useEffect(() => {
        count.current = 0;
    }, []);

    useEffect(() => {
        if (profile?.career_overview?.company_history?.length && count.current !== 0 && count.current !== -1) {
            setExpandedIndex(profile.career_overview.company_history.length - 1);
        } else {
            count.current = count.current + 1;
        }
    }, [profile?.career_overview?.company_history?.length]);

    // Auto-expand invalid company if forceExpandIndex is provided
    useEffect(() => {
        if (typeof forceExpandIndex === 'number' && forceExpandIndex !== expandedIndex) {
            setExpandedIndex(forceExpandIndex);
        }
    }, [forceExpandIndex]);

    // Helper to calculate duration in months
    const calculateDurationMonths = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = dayjs(start);
        const endDate = dayjs(end);
        return Math.max(0, endDate.diff(startDate, 'month'));
    };

    // Handler to update company fields and auto-calculate duration
    const endDateRefs = useRef<Array<HTMLInputElement | null>>([]);
    const handleCompanyChange = (index: number, field: keyof CompanyHistory, value: any) => {
        const company = profile.career_overview.company_history[index];
        let updated = { ...company, [field]: value };
        if (field === 'start_date' || field === 'end_date' || field === 'is_current') {
            const start = field === 'start_date' ? value : company.start_date;
            let end = field === 'end_date' ? value : company.end_date;
            let isCurrent = field === 'is_current' ? value : company.is_current;
            if (isCurrent) {
                end = dayjs().format('YYYY-MM-DD');
                updated.end_date = ""; // keep end_date blank for current
            }
            // Do NOT clear or set end_date when toggling is_current to false
            updated.duration_months = calculateDurationMonths(start, end);
        }
        onCompanyHistoryChange(index, field, value);
        if (field === 'start_date' || field === 'end_date' || field === 'is_current') {
            onCompanyHistoryChange(index, 'duration_months', updated.duration_months);
            // Only clear end_date if toggling to current
            if (field === 'is_current' && value) {
                onCompanyHistoryChange(index, 'end_date', "");
            }
            // Auto-focus end date if toggling to not current
            if (field === 'is_current' && !value && endDateRefs.current[index]) {
                setTimeout(() => endDateRefs.current[index]?.focus(), 0);
            }
        }
    };

    return (
        <div className="flex items-center justify-center p-2">
            <div className="rounded-xl p-6 space-y-6 w-full max-w-3xl">
                <ErrorMessage message={workError} />

                <p className="text-muted-foreground text-sm mb-2">We parsed this from your resume — feel free to tweak or add details.</p>
                {profile?.career_overview?.company_history?.length > 0 ? (
                    <>
                        <div className="space-y-6">
                            {profile.career_overview.company_history.map((company, index) => (
                                <div key={`company-${index}`} className="relative bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-blue-400" />
                                                {company.company_name || <span className="italic text-gray-400">Company</span>}
                                            </div>
                                            <div className="text-sm text-gray-700 mt-1">
                                                {company.position || <span className="italic text-gray-400">Position</span>}<span className="mx-2 text-gray-300">|</span>
                                                {company.start_date} - {company.is_current ? "Present" : company.end_date}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onRemoveCompanyHistory(index)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                aria-label="Remove Experience"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                                className="h-8 px-3"
                                            >
                                                {expandedIndex === index ? "Close" : "Edit"}
                                            </Button>
                                        </div>
                                    </div>
                                    {expandedIndex === index && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Company Name */}
                                            <div className="flex flex-col gap-1">
                                                <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                                    <Briefcase className="w-4 h-4 text-blue-400" />
                                                    Company
                                                    <span className="text-red-500">*</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Name of the company you worked at</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input
                                                    value={company.company_name}
                                                    onChange={e => handleCompanyChange(index, "company_name", e.target.value)}
                                                    placeholder="Company name"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            {/* Position */}
                                            <div className="flex flex-col gap-1">
                                                <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                                    <Briefcase className="w-4 h-4 text-blue-400" />
                                                    Position
                                                    <span className="text-red-500">*</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Your job title or role</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input
                                                    value={company.position}
                                                    onChange={e => handleCompanyChange(index, "position", e.target.value)}
                                                    placeholder="Position"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            {/* Start Date */}
                                            <div className="flex flex-col gap-1">
                                                <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                                    Start Date
                                                    <span className="text-red-500">*</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>When you started this role</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={company.start_date}
                                                    onChange={e => handleCompanyChange(index, "start_date", e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            {/* End Date */}
                                            <div className="flex flex-col gap-1">
                                                <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                                    End Date
                                                    {!company.is_current && <span className="text-red-500">*</span>}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>When you left this role</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={company.end_date}
                                                    onChange={e => handleCompanyChange(index, "end_date", e.target.value)}
                                                    disabled={company.is_current}
                                                    className="h-9 text-sm"
                                                    ref={el => { endDateRefs.current[index] = el; }}
                                                />
                                            </div>
                                            {/* Duration */}
                                            <div className="flex flex-col gap-1">
                                                <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                                    Duration (months)
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Total months in this role</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={company.duration_months}
                                                    onChange={e => onCompanyHistoryChange(index, "duration_months", Number(e.target.value))}
                                                    min={0}
                                                    placeholder="Months"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            {/* Current Position */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Switch
                                                    checked={company.is_current}
                                                    onCheckedChange={v => handleCompanyChange(index, "is_current", v)}
                                                    id={`current-${index}`}
                                                />
                                                <Label htmlFor={`current-${index}`} className="text-sm font-medium">
                                                    This is my current position
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onAddCompanyHistory}
                                className="flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Experience
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No work history found in your resume</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onAddCompanyHistory}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Experience
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
} 