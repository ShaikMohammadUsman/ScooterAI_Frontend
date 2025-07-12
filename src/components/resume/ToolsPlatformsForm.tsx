"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
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

interface ToolsPlatformsFormProps {
    profile: ResumeProfile;
    onArrayChange: (section: string, key: string, arr: string[]) => void;
}

export default function ToolsPlatformsForm({ profile, onArrayChange }: ToolsPlatformsFormProps) {
    // Local state for custom tool options and input for each tools field
    const [crmOptions, setCrmOptions] = useState([
        "Salesforce",
        "HubSpot",
        "Zoho",
        "Pipedrive",
        "Outreach",
        "Apollo",
        "Salesloft",
        "Sales Nav",
        "Gong",
        "Chorus",
        "ZoomInfo",
        "Slack",
        "Notion",
        "Excel",
        "Google Sheets",
        "Other"
    ]);
    const [salesToolOptions, setSalesToolOptions] = useState([
        "LinkedIn Sales Navigator",
        "WhatsApp Business",
        "Gong",
        "Outreach",
        "Apollo",
        "ZoomInfo",
        "SalesLoft",
        "HubSpot Sales",
        "Pipedrive",
        "Salesforce",
        "Chorus",
        "Calendly",
        "Loom",
        "Zoom",
        "Microsoft Teams",
        "Slack",
        "Notion",
        "Excel",
        "Google Sheets",
        "Other"
    ]);
    const [commToolOptions, setCommToolOptions] = useState([
        "Slack",
        "Microsoft Teams",
        "Zoom",
        "Google Meet",
        "WhatsApp Business",
        "LinkedIn",
        "Email",
        "Phone",
        "SMS",
        "Other"
    ]);
    const [customCrm, setCustomCrm] = useState("");
    const [customSalesTool, setCustomSalesTool] = useState("");
    const [customCommTool, setCustomCommTool] = useState("");

    return (
        <div className="flex items-center justify-center p-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CRM Tools */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>CRM Tools You've Used</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>What CRMs have you used regularly for tracking deals and pipeline?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={crmOptions}
                            selected={profile.tools_platforms.crm_used}
                            onChange={(values) => onArrayChange("tools_platforms", "crm_used", values)}
                            placeholder="Select CRM tools..."
                        />
                        {profile.tools_platforms.crm_used.includes("Other") && (
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={customCrm}
                                    onChange={e => setCustomCrm(e.target.value)}
                                    placeholder="Add a new CRM tool..."
                                    className="flex-1"
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && customCrm.trim()) {
                                            if (!crmOptions.includes(customCrm.trim())) {
                                                setCrmOptions([...crmOptions.slice(0, -1), customCrm.trim(), "Other"]);
                                            }
                                            onArrayChange("tools_platforms", "crm_used", [...profile.tools_platforms.crm_used.filter(t => t !== "Other"), customCrm.trim()]);
                                            setCustomCrm("");
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (customCrm.trim() && !crmOptions.includes(customCrm.trim())) {
                                            setCrmOptions([...crmOptions.slice(0, -1), customCrm.trim(), "Other"]);
                                        }
                                        onArrayChange("tools_platforms", "crm_used", [...profile.tools_platforms.crm_used.filter(t => t !== "Other"), customCrm.trim()]);
                                        setCustomCrm("");
                                    }}
                                    disabled={!customCrm.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            E.g. Salesforce, Zoho, HubSpot — searchable dropdown
                        </p>
                    </FormControl>
                    {/* Sales Tools */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Other Sales Tools</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tools that helped with prospecting, outreach, or closing</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={salesToolOptions}
                            selected={profile.tools_platforms.sales_tools}
                            onChange={(values) => onArrayChange("tools_platforms", "sales_tools", values)}
                            placeholder="Select sales tools..."
                        />
                        {profile.tools_platforms.sales_tools.includes("Other") && (
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={customSalesTool}
                                    onChange={e => setCustomSalesTool(e.target.value)}
                                    placeholder="Add a new sales tool..."
                                    className="flex-1"
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && customSalesTool.trim()) {
                                            if (!salesToolOptions.includes(customSalesTool.trim())) {
                                                setSalesToolOptions([...salesToolOptions.slice(0, -1), customSalesTool.trim(), "Other"]);
                                            }
                                            onArrayChange("tools_platforms", "sales_tools", [...profile.tools_platforms.sales_tools.filter(t => t !== "Other"), customSalesTool.trim()]);
                                            setCustomSalesTool("");
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (customSalesTool.trim() && !salesToolOptions.includes(customSalesTool.trim())) {
                                            setSalesToolOptions([...salesToolOptions.slice(0, -1), customSalesTool.trim(), "Other"]);
                                        }
                                        onArrayChange("tools_platforms", "sales_tools", [...profile.tools_platforms.sales_tools.filter(t => t !== "Other"), customSalesTool.trim()]);
                                        setCustomSalesTool("");
                                    }}
                                    disabled={!customSalesTool.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            E.g. LinkedIn Sales Nav, Gong, WhatsApp Business
                        </p>
                    </FormControl>
                    {/* Communication Tools */}
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <FormLabel>Communication Tools</FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>What tools did you use to communicate with prospects and customers?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <MultiSelect
                            options={commToolOptions}
                            selected={profile.tools_platforms.communication_tools}
                            onChange={(values) => onArrayChange("tools_platforms", "communication_tools", values)}
                            placeholder="Select communication tools..."
                        />
                        {profile.tools_platforms.communication_tools.includes("Other") && (
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={customCommTool}
                                    onChange={e => setCustomCommTool(e.target.value)}
                                    placeholder="Add a new communication tool..."
                                    className="flex-1"
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && customCommTool.trim()) {
                                            if (!commToolOptions.includes(customCommTool.trim())) {
                                                setCommToolOptions([...commToolOptions.slice(0, -1), customCommTool.trim(), "Other"]);
                                            }
                                            onArrayChange("tools_platforms", "communication_tools", [...profile.tools_platforms.communication_tools.filter(t => t !== "Other"), customCommTool.trim()]);
                                            setCustomCommTool("");
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (customCommTool.trim() && !commToolOptions.includes(customCommTool.trim())) {
                                            setCommToolOptions([...commToolOptions.slice(0, -1), customCommTool.trim(), "Other"]);
                                        }
                                        onArrayChange("tools_platforms", "communication_tools", [...profile.tools_platforms.communication_tools.filter(t => t !== "Other"), customCommTool.trim()]);
                                        setCustomCommTool("");
                                    }}
                                    disabled={!customCommTool.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            Tools used for customer and team communication
                        </p>
                    </FormControl>
                </div>
            </div>
        </div>
    );
} 