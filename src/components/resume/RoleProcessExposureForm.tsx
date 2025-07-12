"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { ResumeProfile } from "@/lib/resumeService";
import { Input } from "@/components/ui/input";

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface RoleProcessExposureFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    onArrayChange: (section: string, key: string, arr: string[]) => void;
}

export default function RoleProcessExposureForm({ profile, onFieldChange, onArrayChange }: RoleProcessExposureFormProps) {
    return (
        <div className="flex items-center justify-center p-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Process Owned */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Sales Process Owned</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Select all you've owned directly.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={[
                                "Prospecting",
                                "Lead Research",
                                "Outreach",
                                "Emailing",
                                "Qualification",
                                "Demoing",
                                "Proposal Creation",
                                "Objection Handling",
                                "Closing",
                                "Negotiation",
                                "Post-Sale",
                                "Renewals",
                                "Expansion"
                            ]}
                            selected={profile.role_process_exposure.sales_stages_owned}
                            onChange={(values) => onArrayChange("role_process_exposure", "sales_stages_owned", values)}
                            placeholder="Select all stages you've owned..."
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Check all the stages you personally handled — from prospecting to post-sale.
                        </p>
                    </FormControl>
                    {/* Sales Role */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Most Recent Sales Role</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>E.g. SDR, Account Executive, Enterprise Sales — pick what best matches your role title.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Select
                            value={profile.role_process_exposure.sales_role_type}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "sales_role_type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "SDR",
                                    "BDR",
                                    "Inside Sales",
                                    "AE",
                                    "Key Account Manager",
                                    "Enterprise Sales",
                                    "Channel Manager",
                                    "Sales Manager",
                                    "CSM",
                                    "Pre-sales",
                                    "Growth Manager",
                                    "Head of Sales",
                                    "VP",
                                    "Other"
                                ].map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    {/* Position Level */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Position Level</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Were you primarily an IC or did you manage others?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <RadioGroup
                            value={profile.role_process_exposure.position_level}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "position_level", value)}
                            className="flex flex-col gap-3"
                        >
                            {[
                                "Individual Contributor",
                                "Team Lead",
                                "Manager",
                                "Director / VP+"
                            ].map((level) => (
                                <div key={level} className="flex items-center space-x-2">
                                    <RadioGroupItem value={level} id={`position-level-${level}`} />
                                    <label htmlFor={`position-level-${level}`} className="text-sm font-medium">
                                        {level}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    {/* Average Deal Size */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Average Deal Size</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>What was your average closed deal value in your most recent or current role?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Select
                            value={profile.role_process_exposure.average_deal_size_range}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "average_deal_size_range", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select deal size range..." />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "<$1K",
                                    "$1K–$5K",
                                    "$5K–$25K",
                                    "$25K–$100K",
                                    "$100K–$500K",
                                    "$500K–$1M",
                                    "$1M+",
                                    "Varies"
                                ].map((size) => (
                                    <SelectItem key={size} value={size}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                            Support ranges or best estimate
                        </p>
                    </FormControl>
                    {/* Sales Cycle Length */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Typical Sales Cycle Length</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>How long does it usually take to close a deal?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Select
                            value={profile.role_process_exposure.sales_cycle_length}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "sales_cycle_length", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select cycle length..." />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "<1 week",
                                    "1–4 weeks",
                                    "1–3 months",
                                    "3–6 months",
                                    "6–12 months",
                                    "12+ months",
                                    "Varies"
                                ].map((length) => (
                                    <SelectItem key={length} value={length}>
                                        {length}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    {/* Quota Ownership */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Did You Own a Quota?</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Were you responsible for hitting a sales number?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <RadioGroup
                            value={profile.role_process_exposure.quota_ownership?.has_quota ? "Yes" : "No"}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, has_quota: value === "Yes" })}
                            className="flex flex-col gap-3"
                        >
                            {['Yes', 'No'].map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`quota-ownership-${option}`} />
                                    <label htmlFor={`quota-ownership-${option}`} className="text-sm font-medium">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    {/* Quota Details */}
                    {profile.role_process_exposure.quota_ownership?.has_quota && (
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <FormLabel>Quota Details</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Amount, cadence, and attainment history</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="number"
                                    value={profile.role_process_exposure.quota_ownership.amount || ""}
                                    onChange={e => onFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, amount: Number(e.target.value) })}
                                    placeholder="Quota amount"
                                />
                                <Select
                                    value={profile.role_process_exposure.quota_ownership.cadence || ""}
                                    onValueChange={value => onFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, cadence: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cadence..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={profile.role_process_exposure.quota_ownership.attainment_history || ""}
                                    onChange={e => onFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, attainment_history: e.target.value })}
                                    placeholder="Quota attainment history (e.g. 90% in 2023)"
                                />
                            </div>
                        </FormControl>
                    )}
                </div>
            </div>
        </div>
    );
} 