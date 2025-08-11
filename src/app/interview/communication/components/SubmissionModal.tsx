import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface SubmissionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submissionStep: 'processing' | 'uploading';
    uploadProgress?: number;
}

export function SubmissionModal({
    open,
    onOpenChange,
    submissionStep,
    uploadProgress = 0,
}: SubmissionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {submissionStep === 'processing' && "Processing Your Response"}
                        {submissionStep === 'uploading' && "Uploading Interview Video"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {submissionStep === 'processing' && "We're processing your final response..."}
                        {submissionStep === 'uploading' && "Please wait while we upload your interview video..."}
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
                    </motion.div>

                    {/* Manual Close Button - Only show after a reasonable delay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 90 }} // Show after 30 seconds
                        className="mt-4"
                    >
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Close (if taking too long)
                        </button>
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
                        </p>
                        {submissionStep === 'uploading' && (
                            <div className="mt-4 space-y-2">
                                {/* Custom Progress Bar with Moving Scooter */}
                                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                                    {/* Progress Fill */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="h-full bg-blue-600 rounded-full"
                                    />

                                    {/* Moving Scooter Icon */}
                                    <motion.div
                                        initial={{ left: 0 }}
                                        animate={{ left: `${uploadProgress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                                        style={{ left: `${Math.min(uploadProgress, 100)}%` }}
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -2, 0],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="w-6 h-6 relative"
                                        >
                                            <Image
                                                src="/assets/images/scooterLogo.png"
                                                alt="Scooter"
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 object-contain"
                                            />
                                        </motion.div>
                                    </motion.div>
                                </div>
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