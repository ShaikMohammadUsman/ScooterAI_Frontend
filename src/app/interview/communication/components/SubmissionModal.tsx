import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface SubmissionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submissionStep: 'processing' | 'uploading' | 'evaluating';
    uploadProgress?: number;
}

export function SubmissionModal({
    open,
    onOpenChange,
    submissionStep,
    uploadProgress = 0
}: SubmissionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {submissionStep === 'processing' && "Processing Your Response"}
                        {submissionStep === 'uploading' && "Uploading Interview Video"}
                        {submissionStep === 'evaluating' && "Evaluating Communication Skills"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {submissionStep === 'processing' && "We're processing your final response..."}
                        {submissionStep === 'uploading' && "Please wait while we upload your interview video..."}
                        {submissionStep === 'evaluating' && "Analyzing your communication skills..."}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 mb-4"
                    >
                        {submissionStep === 'processing' && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full rounded-full border-4 border-primary border-t-transparent"
                            />
                        )}
                        {submissionStep === 'uploading' && (
                            <motion.div
                                initial={{ y: 0 }}
                                animate={{ y: [-10, 10] }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </motion.div>
                        )}
                        {submissionStep === 'evaluating' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                        )}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center w-full"
                    >
                        <p className="text-lg font-medium text-gray-700">
                            {submissionStep === 'processing' && "Please wait while we process your response..."}
                            {submissionStep === 'uploading' && "Uploading your interview video..."}
                            {submissionStep === 'evaluating' && "Evaluating your communication skills..."}
                        </p>
                        {submissionStep === 'uploading' && (
                            <div className="mt-4 space-y-2">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-sm text-gray-500">
                                    {uploadProgress}% uploaded
                                </p>
                            </div>
                        )}
                        {submissionStep !== 'uploading' && (
                            <p className="text-sm text-gray-500 mt-2">
                                This may take a few moments
                            </p>
                        )}
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 