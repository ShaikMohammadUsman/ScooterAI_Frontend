"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { fetchJobRolesWithTimeRange } from '@/features/jobRoles/jobRolesSlice';
import {
    selectJobRolesWithTimeframe,
    selectJobRolesTimeframeLoading,
    selectJobRolesTimeframeHasLoaded,
    selectJobRolesTimeframeError,
    selectTotalCandidatesTimeframe,
    selectTotalAudioAttendedTimeframe,
    selectTotalVideoAttendedTimeframe,
    selectTotalVideoInvitesTimeframe,
    selectAudioConversionRateTimeframe,
    selectVideoInviteConversionRateTimeframe,
    selectVideoCompletionConversionRateTimeframe,
    selectTotalCandidatesOverall,
    selectTotalAudioAttendedOverall,
    selectTotalVideoAttendedOverall,
    selectTotalVideoInvitesOverall,
    selectAudioConversionRateOverall,
    selectVideoInviteConversionRateOverall,
    selectVideoCompletionConversionRateOverall,
} from '@/features/jobRoles/selectors';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FaUsers, FaMicrophone, FaVideo, FaArrowUp } from 'react-icons/fa';

interface TimeframeFilterProps {
    companyId: string;
    showOverallData?: boolean;
    className?: string;
}

export default function TimeframeFilter({ companyId, showOverallData = true, className = "" }: TimeframeFilterProps) {
    const dispatch = useDispatch<AppDispatch>();
    const jobRolesWithTimeframe = useSelector(selectJobRolesWithTimeframe);
    const loading = useSelector(selectJobRolesTimeframeLoading);
    const hasLoaded = useSelector(selectJobRolesTimeframeHasLoaded);
    const error = useSelector(selectJobRolesTimeframeError);

    // Timeframe data selectors
    const totalCandidatesTimeframe = useSelector(selectTotalCandidatesTimeframe);
    const totalAudioAttendedTimeframe = useSelector(selectTotalAudioAttendedTimeframe);
    const totalVideoAttendedTimeframe = useSelector(selectTotalVideoAttendedTimeframe);
    const totalVideoInvitesTimeframe = useSelector(selectTotalVideoInvitesTimeframe);
    const audioConversionRateTimeframe = useSelector(selectAudioConversionRateTimeframe);
    const videoInviteConversionRateTimeframe = useSelector(selectVideoInviteConversionRateTimeframe);
    const videoCompletionConversionRateTimeframe = useSelector(selectVideoCompletionConversionRateTimeframe);

    // Overall data selectors
    const totalCandidatesOverall = useSelector(selectTotalCandidatesOverall);
    const totalAudioAttendedOverall = useSelector(selectTotalAudioAttendedOverall);
    const totalVideoAttendedOverall = useSelector(selectTotalVideoAttendedOverall);
    const totalVideoInvitesOverall = useSelector(selectTotalVideoInvitesOverall);
    const audioConversionRateOverall = useSelector(selectAudioConversionRateOverall);
    const videoInviteConversionRateOverall = useSelector(selectVideoInviteConversionRateOverall);
    const videoCompletionConversionRateOverall = useSelector(selectVideoCompletionConversionRateOverall);

    const [fromTime, setFromTime] = useState('');
    const [toTime, setToTime] = useState('');
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [dateError, setDateError] = useState('');

    // Get current date and time in datetime-local format
    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        // Load initial data with empty timeframe (overall data)
        if (!hasLoaded) {
            dispatch(fetchJobRolesWithTimeRange({ companyId }));
        }
    }, [dispatch, companyId, hasLoaded]);

    const validateDates = () => {
        setDateError('');

        if (fromTime && toTime) {
            const fromDate = new Date(fromTime);
            const toDate = new Date(toTime);
            const currentDate = new Date();

            // Check if from date is in the future
            if (fromDate > currentDate) {
                setDateError('From date cannot be in the future');
                return false;
            }

            // Check if to date is in the future
            if (toDate > currentDate) {
                setDateError('To date cannot be in the future');
                return false;
            }

            // Check if from date is after to date
            if (fromDate > toDate) {
                setDateError('From date must be before or equal to To date');
                return false;
            }
        } else if (fromTime) {
            const fromDate = new Date(fromTime);
            const currentDate = new Date();

            if (fromDate > currentDate) {
                setDateError('From date cannot be in the future');
                return false;
            }
        } else if (toTime) {
            const toDate = new Date(toTime);
            const currentDate = new Date();

            if (toDate > currentDate) {
                setDateError('To date cannot be in the future');
                return false;
            }
        }

        return true;
    };

    const handleFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromTime(e.target.value);
        setDateError(''); // Clear error when user starts typing
    };

    const handleToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToTime(e.target.value);
        setDateError(''); // Clear error when user starts typing
    };

    const handleApplyFilter = () => {
        if (!validateDates()) {
            return; // Don't proceed if validation fails
        }

        setIsFilterActive(true);
        // Convert datetime-local format to ISO string
        const fromTimeISO = fromTime ? new Date(fromTime).toISOString() : undefined;
        const toTimeISO = toTime ? new Date(toTime).toISOString() : undefined;
        dispatch(fetchJobRolesWithTimeRange({ companyId, fromTime: fromTimeISO, toTime: toTimeISO }));
    };

    const handleClearFilter = () => {
        setIsFilterActive(false);
        setFromTime('');
        setToTime('');
        setDateError('');
        dispatch(fetchJobRolesWithTimeRange({ companyId }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const getCurrentData = () => {
        if (isFilterActive && hasLoaded) {
            return {
                totalCandidates: totalCandidatesTimeframe,
                totalAudioAttended: totalAudioAttendedTimeframe,
                totalVideoAttended: totalVideoAttendedTimeframe,
                totalVideoInvites: totalVideoInvitesTimeframe,
                audioConversionRate: audioConversionRateTimeframe,
                videoInviteConversionRate: videoInviteConversionRateTimeframe,
                videoCompletionConversionRate: videoCompletionConversionRateTimeframe,
            };
        }
        return {
            totalCandidates: totalCandidatesOverall,
            totalAudioAttended: totalAudioAttendedOverall,
            totalVideoAttended: totalVideoAttendedOverall,
            totalVideoInvites: totalVideoInvitesOverall,
            audioConversionRate: audioConversionRateOverall,
            videoInviteConversionRate: videoInviteConversionRateOverall,
            videoCompletionConversionRate: videoCompletionConversionRateOverall,
        };
    };

    const currentData = getCurrentData();

    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Timeframe Filter</h3>
                    {isFilterActive && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Filter Active
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="fromTime">From Date</Label>
                        <Input
                            id="fromTime"
                            type="datetime-local"
                            value={fromTime}
                            onChange={handleFromTimeChange}
                            max={getCurrentDateTime()}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="toTime">To Date</Label>
                        <Input
                            id="toTime"
                            type="datetime-local"
                            value={toTime}
                            onChange={handleToTimeChange}
                            max={getCurrentDateTime()}
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button
                        onClick={handleApplyFilter}
                        disabled={loading || (!fromTime && !toTime)}
                        className="flex-1"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                            </div>
                        ) : (
                            'Apply Filter'
                        )}
                    </Button>
                    {isFilterActive && (
                        <Button
                            onClick={handleClearFilter}
                            variant="outline"
                            disabled={loading}
                        >
                            Clear Filter
                        </Button>
                    )}
                </div>

                {(error || dateError) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">
                            {error ? `Error: ${error}` : dateError}
                        </p>
                    </div>
                )}

                {loading && !hasLoaded && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading data...</p>
                    </div>
                )}

                {hasLoaded && jobRolesWithTimeframe.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <FaUsers className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-sm font-medium">Total Candidates</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {currentData.totalCandidates}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <FaMicrophone className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium">Audio Attended</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {currentData.totalAudioAttended}
                            </div>
                            <div className="text-sm text-gray-600">
                                {currentData?.audioConversionRate}% conversion
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <FaVideo className="w-5 h-5 text-purple-600 mr-2" />
                                <span className="text-sm font-medium">Video Attended</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                                {currentData.totalVideoAttended}
                            </div>
                            <div className="text-sm text-gray-600">
                                {currentData.videoCompletionConversionRate}% completion
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <FaArrowUp className="w-5 h-5 text-orange-600 mr-2" />
                                <span className="text-sm font-medium">Moved to Video</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {currentData.totalVideoInvites}
                            </div>
                            <div className="text-sm text-gray-600">
                                {currentData.videoInviteConversionRate}% invite rate
                            </div>
                        </div>
                    </div>
                )}

                {hasLoaded && jobRolesWithTimeframe.length === 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">No data available for the selected timeframe.</p>
                    </div>
                )}

                {/* {showOverallData && hasLoaded && isFilterActive && jobRolesWithTimeframe.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-md font-semibold mb-3">Overall Data (All Time)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Total Candidates</div>
                                <div className="text-lg font-semibold">{totalCandidatesOverall}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Audio Attended</div>
                                <div className="text-lg font-semibold">{totalAudioAttendedOverall}</div>
                                <div className="text-xs text-gray-500">{audioConversionRateOverall}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Video Attended</div>
                                <div className="text-lg font-semibold">{totalVideoAttendedOverall}</div>
                                <div className="text-xs text-gray-500">{videoCompletionConversionRateOverall}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600">Moved to Video</div>
                                <div className="text-lg font-semibold">{totalVideoInvitesOverall}</div>
                                <div className="text-xs text-gray-500">{videoInviteConversionRateOverall}%</div>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </Card>
    );
}
