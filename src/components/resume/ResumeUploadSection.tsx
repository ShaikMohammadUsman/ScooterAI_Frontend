"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { FiUploadCloud } from "react-icons/fi";

interface ResumeUploadSectionProps {
    file: File | null;
    loading: boolean;
    submitting: boolean;
    consentToUpdates: boolean;
    profile: any;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resumeParsed: boolean;
    canUpload?: boolean; // additional gate for enabling upload (e.g., candidate source selected)
}

export default function ResumeUploadSection({
    file,
    loading,
    submitting,
    consentToUpdates,
    profile,
    onFileChange,
    resumeParsed,
    canUpload = true
}: ResumeUploadSectionProps) {
    return (
        <>
            {/* Resume Upload Section */}
            <div className="mb-8 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                    <div className="flex items-center gap-2 w-full">
                        <label
                            htmlFor="upload-resume"
                            className={`cursor-pointer w-full ${!consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number || !canUpload ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <Button
                                variant="outline"
                                type="button"
                                disabled={loading || submitting || !consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number || !canUpload}
                                onClick={() => {
                                    if (consentToUpdates && !loading && !submitting && profile?.basic_information?.full_name && profile?.basic_information?.email && profile?.basic_information?.phone_number && canUpload) {
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
                        disabled={loading || submitting || !consentToUpdates || !profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number || !canUpload}
                        aria-label="Select resume PDF file"
                    />
                    <p className="text-sm text-red-600 font-medium mt-2">⚠️ Please upload PDF files only!</p>
                    {file && <span className="text-muted-foreground text-sm">{file.name}</span>}
                    {(!profile?.basic_information?.full_name || !profile?.basic_information?.email || !profile?.basic_information?.phone_number) && (
                        <p className="text-sm text-orange-600">Please fill in your name, email, and phone number above to upload your resume.</p>
                    )}

                    {/* Message when no resume has been uploaded */}
                    {!loading && !file && (
                        <div className="mb-8 text-center mt-8">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                                <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume First</h3>
                                <p className="text-sm text-gray-600">
                                    Please upload your resume above to extract your information and start building your profile.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 