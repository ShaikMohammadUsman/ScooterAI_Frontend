"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FaVideo } from 'react-icons/fa';
import { toast } from "@/hooks/use-toast";
import { resetVideoInterview } from '@/lib/adminService';
import { Candidate } from '@/lib/adminService';

interface ResetVideoInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onSuccess: () => void;
}

export default function ResetVideoInterviewModal({
    isOpen,
    onClose,
    candidate,
    onSuccess
}: ResetVideoInterviewModalProps) {
    const [resetReason, setResetReason] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleResetVideoInterview = async () => {
        if (!candidate || !resetReason.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for resetting the video interview",
                variant: "destructive"
            });
            return;
        }

        setIsResetting(true);
        try {
            const response = await resetVideoInterview({
                user_id: candidate.profile_id,
                reset_reason: resetReason.trim()
            });

            if (response.status) {
                toast({
                    title: "Success",
                    description: "Video interview reset successfully"
                });
                setResetReason('');
                onSuccess();
                onClose();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to reset video interview",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error resetting video interview:', error);
            toast({
                title: "Error",
                description: "Failed to reset video interview",
                variant: "destructive"
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleClose = () => {
        if (!isResetting) {
            setResetReason('');
            onClose();
        }
    };

    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Reset Video Interview</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isResetting}
                        >
                            ✕
                        </Button>
                    </div>

                    {/* Warning Message */}
                    <div className="mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaVideo className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-red-800">
                                        Reset Video Interview
                                    </h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        This action will reset the video interview for{' '}
                                        <span className="font-semibold">
                                            {candidate.basic_information?.full_name}
                                        </span>
                                        . The candidate will need to complete the video interview again.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="mb-6">
                        <Label htmlFor="resetReason" className="text-sm font-medium text-gray-700 mb-2 block">
                            Reason for Reset *
                        </Label>
                        <textarea
                            id="resetReason"
                            value={resetReason}
                            onChange={(e) => setResetReason(e.target.value)}
                            placeholder="Enter the reason for resetting the video interview..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={3}
                            required
                            disabled={isResetting}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isResetting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleResetVideoInterview}
                            disabled={!resetReason.trim() || isResetting}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isResetting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Resetting...
                                </>
                            ) : (
                                'Reset Video Interview'
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
