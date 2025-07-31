"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaCheck, FaTimes, FaUserCheck, FaUserTimes } from 'react-icons/fa';

interface ShortlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (status: string, note: string) => void;
    candidateName: string;
    isLoading: boolean;
    currentStatus?: boolean | null;
    currentNote?: string;
}

export default function ShortlistModal({
    isOpen,
    onClose,
    onSubmit,
    candidateName,
    isLoading,
    currentStatus,
    currentNote
}: ShortlistModalProps) {
    const [status, setStatus] = useState<string>('');
    const [note, setNote] = useState('');

    // Initialize form with current values when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatus(currentStatus === true ? 'approve' : currentStatus === false ? 'reject' : '');
            setNote(currentNote || '');
        }
    }, [isOpen, currentStatus, currentNote]);

    const handleSubmit = () => {
        if (!status) {
            return;
        }
        onSubmit(status, note);
        // Reset form
        setStatus('');
        setNote('');
    };

    const handleClose = () => {
        setStatus('');
        setNote('');
        onClose();
    };

    const getStatusDisplay = (status: boolean | null | undefined) => {
        if (status === true) {
            return { text: 'Approved for Hiring Manager', icon: <FaUserCheck className="h-3 w-3" />, color: 'bg-green-100 text-green-800' };
        } else if (status === false) {
            return { text: 'Not Shortlisted', icon: <FaUserTimes className="h-3 w-3" />, color: 'bg-red-100 text-red-800' };
        } else {
            return { text: 'Not Reviewed', icon: <div className="w-3 h-3 bg-gray-400 rounded-full"></div>, color: 'bg-gray-100 text-gray-800' };
        }
    };

    if (!isOpen) return null;

    const currentStatusDisplay = getStatusDisplay(currentStatus);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Final Shortlist Decision
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Approve candidate for hiring manager review</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                        >
                            <FaTimes className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Candidate Name and Current Status */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Candidate:</p>
                        <p className="font-medium text-gray-900 mb-2">{candidateName}</p>

                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatusDisplay.color}`}>
                            {currentStatusDisplay.icon}
                            {currentStatusDisplay.text}
                        </div>
                    </div>

                    {/* Decision Selection */}
                    <div className="mb-4">
                        <Label className="text-sm font-medium mb-3 block">
                            Final Shortlist Decision *
                        </Label>
                        <div className="space-y-2">
                            <Button
                                type="button"
                                variant={status === 'approve' ? 'default' : 'outline'}
                                onClick={() => setStatus('approve')}
                                className={`w-full justify-start gap-2 ${status === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'border-green-200 hover:bg-green-50'
                                    }`}
                            >
                                <FaCheck className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Approve for Hiring Manager</div>
                                    <div className="text-xs opacity-80">Candidate will be sent to hiring manager for final review</div>
                                </div>
                            </Button>

                            <Button
                                type="button"
                                variant={status === 'reject' ? 'default' : 'outline'}
                                onClick={() => setStatus('reject')}
                                className={`w-full justify-start gap-2 ${status === 'reject'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'border-red-200 hover:bg-red-50'
                                    }`}
                            >
                                <FaTimes className="h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Remove from Shortlist</div>
                                    <div className="text-xs opacity-80">Candidate will not proceed to hiring manager</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Note Field */}
                    <div className="mb-6">
                        <Label htmlFor="note" className="text-sm font-medium">
                            Note (Optional)
                        </Label>
                        <Textarea
                            id="note"
                            placeholder="Add a note about this decision..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !status}
                            className="flex-1 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    Submit Decision
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
} 