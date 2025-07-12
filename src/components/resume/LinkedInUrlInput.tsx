"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Linkedin } from "lucide-react";

// LinkedIn URL validation function
const isValidLinkedInUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;

    const linkedInPatterns = [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/
    ];

    return linkedInPatterns.some(pattern => pattern.test(url.trim()));
};

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface LinkedInUrlInputProps {
    linkedInUrl: string;
    onLinkedInUrlChange: (url: string) => void;
}

export default function LinkedInUrlInput({ linkedInUrl, onLinkedInUrlChange }: LinkedInUrlInputProps) {
    return (
        <div className="mb-6 w-full max-w-md mx-auto">
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>LinkedIn profile (optional)</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Used to match and enrich your resume data — optional.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <form className="flex gap-2">
                    <Input
                        value={linkedInUrl}
                        onChange={e => onLinkedInUrlChange(e.target.value)}
                        placeholder="https://linkedin.com/in/your-profile"
                        className="flex-1"
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    // disabled={!linkedInUrl || linkedInUrl.length === 0 || !isValidLinkedInUrl(linkedInUrl)}
                                    // onClick={() => window.open(`${linkedInUrl}`, "_blank")}
                                    onClick={() => window.open("https://www.linkedin.com/in/", "_blank")}
                                >
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    See Profile
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {!linkedInUrl || linkedInUrl.length === 0
                                        ? "Enter a LinkedIn profile URL"
                                        : !isValidLinkedInUrl(linkedInUrl)
                                            ? "Enter a valid LinkedIn profile URL"
                                            : "Open LinkedIn profile"
                                    }
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </form>
            </FormControl>
        </div>
    );
} 