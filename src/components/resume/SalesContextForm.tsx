"use client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { TrendingUp, ArrowRightLeft, Building2, Globe, Users } from "lucide-react";
import { ResumeProfile } from "@/lib/resumeService";
import { INDUSTRIES, REGIONS, BUYER_PERSONAS } from "@/lib/formConstants";

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface SalesContextFormProps {
    profile: ResumeProfile;
    onArrayChange: (section: string, key: string, arr: string[]) => void;
}

export default function SalesContextForm({ profile, onArrayChange }: SalesContextFormProps) {
    return (
        <div className="flex items-center justify-center p-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl relative overflow-hidden">
                {/* Subtle background icon */}
                <TrendingUp className="absolute right-6 top-6 w-24 h-24 text-blue-50 opacity-30 pointer-events-none z-0" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Sales Type */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-400" />Sales Type</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Do you primarily sell to businesses (B2B), consumers (B2C), or both?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <RadioGroup
                            value={profile.sales_context.sales_type[0] || ""}
                            onValueChange={(value) => onArrayChange("sales_context", "sales_type", [value])}
                            className="flex flex-col gap-3"
                        >
                            {['B2B', 'B2C', 'Both'].map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <RadioGroupItem value={type} id={`sales-type-${type}`} />
                                    <label htmlFor={`sales-type-${type}`} className="text-sm font-medium">
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    {/* Sales Motion */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><ArrowRightLeft className="w-4 h-4 text-green-500" />Sales Motion</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Inbound means leads come to you; outbound means you reach out first.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <RadioGroup
                            value={profile.sales_context.sales_motion[0] || ""}
                            onValueChange={(value) => onArrayChange("sales_context", "sales_motion", [value])}
                            className="flex flex-col gap-3"
                        >
                            {['Inbound', 'Outbound', 'Mixed'].map((motion) => (
                                <div key={motion} className="flex items-center space-x-2">
                                    <RadioGroupItem value={motion} id={`sales-motion-${motion}`} />
                                    <label htmlFor={`sales-motion-${motion}`} className="text-sm font-medium">
                                        {motion}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    {/* Industries Sold Into */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><Building2 className="w-4 h-4 text-yellow-500" />Industries You've Sold Into</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>E.g. SaaS, EdTech, BFSI — helps understand your domain experience.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={INDUSTRIES}
                            selected={profile.sales_context.industries_sold_into}
                            onChange={(values) => onArrayChange("sales_context", "industries_sold_into", values)}
                            placeholder="Select industries..."
                        />
                    </FormControl>
                    {/* Regions Sold Into */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><Globe className="w-4 h-4 text-blue-500" />Regions You've Sold Into</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>What countries or geographies have your customers typically been in?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={REGIONS}
                            selected={profile.sales_context.regions_sold_into}
                            onChange={(values) => onArrayChange("sales_context", "regions_sold_into", values)}
                            placeholder="Select regions..."
                        />
                    </FormControl>
                    {/* Buyer Personas */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-1"><Users className="w-4 h-4 text-purple-500" />Who Were Your Buyers?</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Who did you typically sell to? Job titles or decision-maker roles.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={BUYER_PERSONAS}
                            selected={profile.sales_context.buyer_personas}
                            onChange={(values) => onArrayChange("sales_context", "buyer_personas", values)}
                            placeholder="Select buyer personas..."
                        />
                    </FormControl>
                </div>
            </div>
        </div>
    );
} 