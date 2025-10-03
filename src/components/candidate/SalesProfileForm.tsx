"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { ResumeProfile } from "@/lib/resumeService";

interface SalesProfileFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    onArrayChange: (section: string, key: string, arr: string[]) => void;
}

// Constants based on the exact form specifications
const INDUSTRIES = [
    "SaaS / Tech",
    "Healthcare",
    "Financial Services",
    "Manufacturing",
    "Real Estate",
    "Other (please specify)"
];

const PRODUCTS_SERVICES = [
    "Software / SaaS",
    "Medical devices",
    "Insurance",
    "Marketing tools",
    "Professional services",
    "Other (please specify)"
];

const DECISION_MAKERS = [
    "C-suite (CEO, CFO, etc.)",
    "IT managers / technical buyers",
    "Small business owners",
    "Enterprise buyers / large companies",
    "SMB market",
    "Other (please specify)"
];

const SALES_STAGES = [
    "Full cycle (prospecting → closing)",
    "Lead qualification & demos",
    "Closing & account expansion",
    "Inbound lead conversion",
    "Other (please specify)"
];

const CAREER_ACHIEVEMENTS = [
    "Consistently beat quota",
    "Promoted quickly",
    "President's Club / Top performer award",
    "Increased territory / revenue growth",
    "Rookie of the Year / New hire awards",
    "Other (please specify)"
];

const QUOTA_MEASUREMENTS = [
    "Number of appointments set",
    "Number of qualified appointments",
    "Pipeline value",
    "Revenue ($ / ₹)",
    "Other (please specify)"
];

const PERFORMANCE_RANGES = [
    "120%+ of target",
    "110–119%",
    "100–109%",
    "90–99%",
    "Below 90%",
    "Not applicable / not given targets"
];

export default function SalesProfileForm({ profile, onFieldChange, onArrayChange }: SalesProfileFormProps) {
    const [hasQuotaDetails, setHasQuotaDetails] = useState(false);
    const [otherIndustry, setOtherIndustry] = useState("");
    const [otherProduct, setOtherProduct] = useState("");
    const [otherDecisionMaker, setOtherDecisionMaker] = useState("");
    const [otherSalesStage, setOtherSalesStage] = useState("");
    const [otherAchievement, setOtherAchievement] = useState("");
    const [otherQuotaMeasurement, setOtherQuotaMeasurement] = useState("");
    const [quotaTarget, setQuotaTarget] = useState("");

    const handleHasQuotaChange = (value: string) => {
        setHasQuotaDetails(value === "yes");
        onFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure?.quota_ownership, has_quota: value === "yes" });
    };

    // Helper to add "Other" options to arrays
    const addOtherToArray = (originalArray: string[], currentValue: string[], otherValue: string): string[] => {
        if (!otherValue.trim()) return currentValue;
        return [...currentValue.filter(item => !item.includes("Other:")), `Other: ${otherValue.trim()}`];
    };

    return (
        <div className="space-y-6 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                {/* <div className="space-y-6"> */}
                {/* 1. Industries */}
                <div>
                    <Label className="text-sm font-medium">
                        Which industries have your recent employers been in?*
                    </Label>
                    <MultiSelect
                        options={INDUSTRIES}
                        selected={profile.sales_context?.industries_sold_into || []}
                        onChange={(values) => {
                            const valuesWithOther = addOtherToArray(INDUSTRIES, values, otherIndustry);
                            onArrayChange("sales_context", "industries_sold_into", valuesWithOther);
                        }}
                        placeholder="Select industries..."
                        className="mt-2"
                    />
                    {profile.sales_context?.industries_sold_into?.some(item => item.includes("Other:")) && (
                        <Input
                            placeholder="Other (please specify)"
                            className="mt-2"
                            value={otherIndustry}
                            onChange={(e) => {
                                setOtherIndustry(e.target.value);
                                const updatedValues = addOtherToArray(INDUSTRIES, profile.sales_context?.industries_sold_into || [], e.target.value);
                                onArrayChange("sales_context", "industries_sold_into", updatedValues);
                            }}
                        />
                    )}
                </div>

                {/* 2. Products/Services */}
                <div>
                    <Label className="text-sm font-medium">
                        What type of products or services did you sell?*
                    </Label>
                    <MultiSelect
                        options={PRODUCTS_SERVICES}
                        selected={profile.sales_context?.sales_type || []}
                        onChange={(values) => {
                            const valuesWithOther = addOtherToArray(PRODUCTS_SERVICES, values, otherProduct);
                            onArrayChange("sales_context", "sales_type", valuesWithOther);
                        }}
                        placeholder="Select products/services..."
                        className="mt-2"
                    />
                    {profile.sales_context?.sales_type?.some(item => item.includes("Other:")) && (
                        <Input
                            placeholder="Other (please specify)"
                            className="mt-2"
                            value={otherProduct}
                            onChange={(e) => {
                                setOtherProduct(e.target.value);
                                const updatedValues = addOtherToArray(PRODUCTS_SERVICES, profile.sales_context?.sales_type || [], e.target.value);
                                onArrayChange("sales_context", "sales_type", updatedValues);
                            }}
                        />
                    )}
                </div>

                {/* 3. Decision Makers */}
                <div>
                    <Label className="text-sm font-medium">
                        Who were the typical decision-makers you sold to?*
                    </Label>
                    <MultiSelect
                        options={DECISION_MAKERS}
                        selected={profile.sales_context?.buyer_personas || []}
                        onChange={(values) => {
                            const valuesWithOther = addOtherToArray(DECISION_MAKERS, values, otherDecisionMaker);
                            onArrayChange("sales_context", "buyer_personas", valuesWithOther);
                        }}
                        placeholder="Select decision makers..."
                        className="mt-2"
                    />
                    {profile.sales_context?.buyer_personas?.some(item => item.includes("Other:")) && (
                        <Input
                            placeholder="Other (please specify)"
                            className="mt-2"
                            value={otherDecisionMaker}
                            onChange={(e) => {
                                setOtherDecisionMaker(e.target.value);
                                const updatedValues = addOtherToArray(DECISION_MAKERS, profile.sales_context?.buyer_personas || [], e.target.value);
                                onArrayChange("sales_context", "buyer_personas", updatedValues);
                            }}
                        />
                    )}
                </div>

                {/* 4. Sales Stages */}
                <div>
                    <Label className="text-sm font-medium">
                        Which stages of the sales process were you responsible for?*
                    </Label>
                    <MultiSelect
                        options={SALES_STAGES}
                        selected={profile.role_process_exposure?.sales_stages_owned || []}
                        onChange={(values) => {
                            const valuesWithOther = addOtherToArray(SALES_STAGES, values, otherSalesStage);
                            onArrayChange("role_process_exposure", "sales_stages_owned", valuesWithOther);
                        }}
                        placeholder="Select sales stages..."
                        className="mt-2"
                    />
                    {profile.role_process_exposure?.sales_stages_owned?.some(item => item.includes("Other:")) && (
                        <Input
                            placeholder="Other (please specify)"
                            className="mt-2"
                            value={otherSalesStage}
                            onChange={(e) => {
                                setOtherSalesStage(e.target.value);
                                const updatedValues = addOtherToArray(SALES_STAGES, profile.role_process_exposure?.sales_stages_owned || [], e.target.value);
                                onArrayChange("role_process_exposure", "sales_stages_owned", updatedValues);
                            }}
                        />
                    )}
                </div>

                {/* 5. Career Achievements */}
                <div>
                    <Label className="text-sm font-medium">
                        Which of these apply to your sales career so far?*
                    </Label>
                    <MultiSelect
                        options={CAREER_ACHIEVEMENTS}
                        selected={profile.sales_context?.sales_motion || []}
                        onChange={(values) => {
                            const valuesWithOther = addOtherToArray(CAREER_ACHIEVEMENTS, values, otherAchievement);
                            onArrayChange("sales_context", "sales_motion", valuesWithOther);
                        }}
                        placeholder="Select achievements..."
                        className="mt-2"
                    />
                    {profile.sales_context?.sales_motion?.some(item => item.includes("Other:")) && (
                        <Input
                            placeholder="Other (please specify)"
                            className="mt-2"
                            value={otherAchievement}
                            onChange={(e) => {
                                setOtherAchievement(e.target.value);
                                const updatedValues = addOtherToArray(CAREER_ACHIEVEMENTS, profile.sales_context?.sales_motion || [], e.target.value);
                                onArrayChange("sales_context", "sales_motion", updatedValues);
                            }}
                        />
                    )}
                </div>
                {/* </div> */}

                {/* Right Column */}
                <div className="space-y-6">
                    {/* 6. Quota Questions */}
                    <div>
                        <Label className="text-sm font-medium">
                            Did you have a sales quota/target?*
                        </Label>
                        <RadioGroup
                            value={profile.role_process_exposure?.quota_ownership?.has_quota ? "yes" : "no"}
                            onValueChange={handleHasQuotaChange}
                            className="mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="quota-yes" />
                                <label htmlFor="quota-yes" className="text-sm">Yes (I had a sales target)</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="quota-no" />
                                <label htmlFor="quota-no" className="text-sm">No (support / non-quota role)</label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                {/* 7a. Quota Measurement (only if answer to 6 was YES) */}
                {hasQuotaDetails && (
                    <div>
                        <Label className="text-sm font-medium">
                            How was your quota measured?
                        </Label>
                        <RadioGroup
                            value={profile.role_process_exposure?.quota_ownership?.cadence || ""}
                            onValueChange={(value) => {
                                if (value === "Other (please specify)") {
                                    onFieldChange("role_process_exposure", "quota_ownership", {
                                        ...profile.role_process_exposure?.quota_ownership,
                                        cadence: "Other (please specify)"
                                    });
                                } else {
                                    onFieldChange("role_process_exposure", "quota_ownership", {
                                        ...profile.role_process_exposure?.quota_ownership,
                                        cadence: value
                                    });
                                }
                            }}
                            className="mt-2 space-y-2"
                        >
                            {QUOTA_MEASUREMENTS.map((measurement) => (
                                <div key={measurement} className="flex items-center space-x-2">
                                    <RadioGroupItem value={measurement} id={`quota-${measurement}`} />
                                    <label htmlFor={`quota-${measurement}`} className="text-sm">{measurement}</label>
                                </div>
                            ))}
                        </RadioGroup>
                        {profile.role_process_exposure?.quota_ownership?.cadence === "Other (please specify)" && (
                            <Input
                                placeholder="Other (please specify)"
                                className="mt-2"
                                value={otherQuotaMeasurement}
                                onChange={(e) => {
                                    setOtherQuotaMeasurement(e.target.value);
                                    onFieldChange("role_process_exposure", "quota_ownership", {
                                        ...profile.role_process_exposure?.quota_ownership,
                                        cadence: `Other: ${e.target.value}`
                                    });
                                }}
                            />
                        )}
                    </div>
                )}

                {/* 7b. Quota Target */}
                {hasQuotaDetails && (
                    <div>
                        <Label className="text-sm font-medium">
                            What was your quota target?
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">Examples: "₹2 Cr annual revenue", "$500K ARR", "50 meetings/month"</p>
                        <Input
                            placeholder="ex: ₹2 Cr annual revenue"
                            className="mt-2"
                            value={quotaTarget}
                            onChange={(e) => {
                                setQuotaTarget(e.target.value);
                                onFieldChange("role_process_exposure", "quota_ownership", {
                                    ...profile.role_process_exposure?.quota_ownership,
                                    amount: parseInt(e.target.value) || 0
                                });
                            }}
                        />
                    </div>
                )}

                {/* 7c. Performance Against Target */}
                {hasQuotaDetails && (
                    <div>
                        <Label className="text-sm font-medium">
                            How did you perform against target (on average)?
                        </Label>
                        <RadioGroup
                            value={profile.role_process_exposure?.quota_ownership?.attainment_history || ""}
                            onValueChange={(value) => onFieldChange("role_process_exposure", "quota_ownership", {
                                ...profile.role_process_exposure?.quota_ownership,
                                attainment_history: value
                            })}
                            className="mt-2 grid grid-cols-2 gap-2"
                        >
                            {PERFORMANCE_RANGES.map((range) => (
                                <div key={range} className="flex items-center space-x-2">
                                    <RadioGroupItem value={range} id={`performance-${range}`} />
                                    <label htmlFor={`performance-${range}`} className="text-sm">{range}</label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}
            </div>
        </div>
    );
}
