"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, X } from "lucide-react";
import { CompanyHistory, ResumeProfile } from "@/lib/resumeService";

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
}

export default function WorkHistoryForm({
    profile,
    onCompanyHistoryChange,
    onAddCompanyHistory,
    onRemoveCompanyHistory
}: WorkHistoryFormProps) {
    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                We parsed this from your resume — feel free to tweak or add details.
            </p>

            {profile?.career_overview?.company_history?.length > 0 ? (
                <>
                    <div className="grid gap-4">
                        {profile.career_overview.company_history.map((company, index) => (
                            <Card key={`company-${index}`} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 p-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveCompanyHistory(index)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Company Name */}
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Company</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Your employer's name as it should appear</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <Input
                                                value={company.company_name}
                                                onChange={e => onCompanyHistoryChange(index, "company_name", e.target.value)}
                                                placeholder="Enter company name"
                                                required
                                                className="font-medium"
                                            />
                                        </div>

                                        {/* Position */}
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Position</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Your job title or role</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <Input
                                                value={company.position}
                                                onChange={e => onCompanyHistoryChange(index, "position", e.target.value)}
                                                placeholder="Enter your position"
                                                required
                                                className="font-medium"
                                            />
                                        </div>

                                        {/* Duration */}
                                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormControl>
                                                <FormLabel>Start Date</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={company.start_date}
                                                    onChange={e => onCompanyHistoryChange(index, "start_date", e.target.value)}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>End Date</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={company.end_date}
                                                    onChange={e => onCompanyHistoryChange(index, "end_date", e.target.value)}
                                                    disabled={company.is_current}
                                                    required={!company.is_current}
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel>Duration</FormLabel>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Total months in this role</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={company.duration_months}
                                                    onChange={e => onCompanyHistoryChange(index, "duration_months", Number(e.target.value))}
                                                    min={0}
                                                    required
                                                    placeholder="Months"
                                                />
                                            </FormControl>
                                        </div>

                                        {/* Current Position */}
                                        <div className="col-span-2">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={company.is_current}
                                                    onCheckedChange={v => onCompanyHistoryChange(index, "is_current", v)}
                                                    id={`current-${index}`}
                                                />
                                                <Label htmlFor={`current-${index}`} className="text-sm font-medium">
                                                    This is my current position
                                                </Label>
                                            </div>
                                            {company.is_current && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    End date will be automatically set to "Present"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
    );
} 