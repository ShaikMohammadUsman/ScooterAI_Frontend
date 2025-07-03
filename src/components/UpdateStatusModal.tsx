"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCheck, FaTimes } from 'react-icons/fa';

interface UpdateStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (status: string, note: string) => void;
    candidateName: string;
    isLoading: boolean;
    currentStatus?: boolean | null;
    currentNote?: string;
}

export default function UpdateStatusModal({
    isOpen,
    onClose,
    onSubmit,
    candidateName,
    isLoading,
    currentStatus,
    currentNote
}: UpdateStatusModalProps) {
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');

    // Initialize form with current values when modal opens
    useEffect(() => {
        if (isOpen) {
            if (currentStatus !== null && currentStatus !== undefined) {
                setStatus(currentStatus ? 'approve' : 'reject');
            } else {
                setStatus('');
            }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Update Application Status
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Review and update candidate status</p>
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

                        {currentStatus !== null && currentStatus !== undefined ? (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatus
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {currentStatus ? (
                                    <>
                                        <FaCheck className="h-3 w-3" />
                                        Currently Approved
                                    </>
                                ) : (
                                    <>
                                        <FaTimes className="h-3 w-3" />
                                        Currently Rejected
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                Status Pending
                            </div>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div className="mb-4">
                        <Label htmlFor="status" className="text-sm font-medium">
                            Application Status *
                        </Label>
                        <Select
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="approve">Approve</SelectItem>
                                <SelectItem value="reject">Reject</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Note Field */}
                    <div className="mb-6">
                        <Label htmlFor="note" className="text-sm font-medium">
                            Note (Optional)
                        </Label>
                        <Textarea
                            id="note"
                            placeholder="Add a note about this candidate..."
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