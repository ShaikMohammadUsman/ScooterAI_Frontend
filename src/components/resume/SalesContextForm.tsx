"use client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Type */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Sales Type</FormLabel>
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
                    {["B2B", "B2C", "Both"].map((type) => (
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
                    <FormLabel>Sales Motion</FormLabel>
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
                    {["Inbound", "Outbound", "Mixed"].map((motion) => (
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
                    <FormLabel>Industries You've Sold Into</FormLabel>
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
                <p className="text-sm text-muted-foreground mt-1">
                    Select from common industries
                </p>
            </FormControl>

            {/* Regions Sold Into */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Regions You've Sold Into</FormLabel>
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
                <p className="text-sm text-muted-foreground mt-1">
                    Select all regions where you have sales experience
                </p>
            </FormControl>

            {/* Buyer Personas */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Who Were Your Buyers?</FormLabel>
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
                <p className="text-sm text-muted-foreground mt-1">
                    E.g. HR Heads, CXOs, Procurement — select from common roles
                </p>
            </FormControl>
        </div>
    );
} 