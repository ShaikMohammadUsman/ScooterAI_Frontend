"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { FiUploadCloud } from "react-icons/fi";
import { ParsingMessage } from "@/components/ui/parsing-message";

interface ResumeUploadSectionProps {
    file: File | null;
    loading: boolean;
    submitting: boolean;
    consentToUpdates: boolean;
    profile: any;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resumeParsed: boolean;
}

export default function ResumeUploadSection({
    file,
    loading,
    submitting,
    consentToUpdates,
    profile,
    onFileChange,
    resumeParsed
}: ResumeUploadSectionProps) {
    return (
        <>
            {/* Resume Upload Section */}
            <div className="mb-8 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                    <div className="flex items-center gap-2 w-full">
                        <label
                            htmlFor="upload-resume"
                            className={`cursor-pointer w-full ${!consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <Button
                                variant="outline"
                                type="button"
                                disabled={loading || submitting || !consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number}
                                onClick={() => {
                                    if (consentToUpdates && !loading && !submitting && profile?.basic_information?.full_name && profile?.basic_information?.email && profile?.basic_information?.phone_number) {
                                        document.getElementById('upload-resume')?.click();
                                    }
                                }}
                                className="h-12 px-6 text-lg w-full hover:bg-primary hover:text-white transition-colors"
                            >
                                <FiUploadCloud className="mr-2 w-5 h-5" />
                                Upload your resume
                            </Button>
                        </label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="ml-2">
                                        <InfoIcon className="h-5 w-5 text-muted-foreground" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>We'll extract your experience and roles to save you typing.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <input
                        id="upload-resume"
                        name="upload-resume"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileChange}
                        disabled={loading || submitting || !consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number}
                        aria-label="Select resume PDF file"
                    />
                    {file && <span className="text-muted-foreground text-sm">{file.name}</span>}
                    {(!profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number) && (
                        <p className="text-sm text-orange-600">Please fill in your name, email, and phone number above to upload your resume.</p>
                    )}
                </div>
                {loading && (
                    <>
                        <ParsingMessage />
                    </>
                )}
            </div>

            {/* Message when resume hasn't been parsed yet */}
            {!resumeParsed && loading && file && (
                <div className="mb-8 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-800 font-medium">Processing your resume...</span>
                        </div>
                        <p className="text-sm text-blue-700">
                            We're extracting your information. This may take a few moments.
                        </p>
                    </div>
                </div>
            )}

            {/* Message when no resume has been uploaded */}
            {!resumeParsed && !loading && !file && (
                <div className="mb-8 text-center">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                        <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume First</h3>
                        <p className="text-sm text-gray-600">
                            Please upload your resume above to extract your information and start building your profile.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
} 