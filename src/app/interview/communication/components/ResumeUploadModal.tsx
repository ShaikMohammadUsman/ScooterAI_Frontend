import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { updateResume } from '@/lib/resumeService';
import { toast } from '@/hooks/use-toast';

interface ResumeUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    onResumeUploaded: () => void;
}

export function ResumeUploadModal({
    open,
    onOpenChange,
    userId,
    onResumeUploaded
}: ResumeUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file type
            if (!allowedFileTypes.includes(file.type) &&
                !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
                toast({
                    title: "Invalid file type",
                    description: "Please select a PDF, DOC, DOCX, or TXT file.",
                    variant: "destructive"
                });
                return;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please select a file smaller than 10MB.",
                    variant: "destructive"
                });
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !userId) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            await updateResume({
                user_id: userId,
                file: selectedFile
            });

            toast({
                title: "Resume uploaded successfully!",
                description: "Your resume has been updated and you can now proceed with the interview.",
            });

            onResumeUploaded();
            onOpenChange(false);
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload resume. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.toLowerCase().split('.').pop();
        switch (extension) {
            case 'pdf':
                return <FaFilePdf className="w-6 h-6 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FaFileWord className="w-6 h-6 text-blue-500" />;
            case 'txt':
                return <FaFileAlt className="w-6 h-6 text-gray-500" />;
            default:
                return <FaFileAlt className="w-6 h-6 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Resume Update Required
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Please upload your latest resume to continue with the interview
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* File Upload Area */}
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${selectedFile
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                        {getFileIcon(selectedFile.name)}
                                        <span className="font-medium text-green-700">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-600">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="mt-2"
                                    >
                                        <FaTimes className="w-4 h-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <FaUpload className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Click to select a file or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, or TXT (max 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                    className="bg-primary h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="flex-1"
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            className="flex-1"
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FaUpload className="w-4 h-4" />
                                    <span>Upload Resume</span>
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Why is this required?</h4>
                        <p className="text-sm text-blue-700">
                            Your resume information needs to be updated to ensure we have the most current details for your interview evaluation.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 