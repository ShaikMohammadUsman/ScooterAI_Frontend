"use client";

import { useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSuccessPopupProps {
    visible: boolean;
    onProceed: () => void;
}

export default function ProfileSuccessPopup({
    visible,
    onProceed,
}: ProfileSuccessPopupProps) {
    // Auto-redirect after 5 seconds
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onProceed();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [visible, onProceed]);

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-xl p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-bg-main rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 relative"
                >
                    {/* Success Icon */}
                    <div className="text-center mb-6">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                            <CheckCircle className="text-white w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Profile Created Successfully!
                        </h3>

                        <p className="text-gray-600 mb-4">
                            Your profile has been created and you're ready to explore opportunities.
                        </p>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-800 mb-2">What's next?</h4>
                        <p className="text-sm text-gray-600">
                            We're redirecting you to our careers page where you can browse and apply for exciting job opportunities.
                        </p>
                    </div>

                    {/* Auto-redirect countdown */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500">
                            Redirecting automatically in <span className="font-semibold text-orange-500">5</span> seconds...
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onProceed}
                            variant="primary"
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            Go to Careers
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
