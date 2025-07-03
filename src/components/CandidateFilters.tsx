"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaFilter, FaTimes, FaSearch, FaUserCheck, FaUserTimes, FaClock, FaGraduationCap, FaBriefcase, FaMicrophone, FaVideo, FaBars } from 'react-icons/fa';

interface FilterState {
    audioPassed: boolean;
    videoAttended: boolean;
    audioUploaded: boolean;
    applicationStatus: string;
    experienceRange: string;
    salesExperienceRange: string;
}

interface CandidateFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    pageLoading: boolean;
    candidatesCount: number;
    filteredCount: number;
}

export default function CandidateFilters({
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    pageLoading,
    candidatesCount,
    filteredCount
}: CandidateFiltersProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const clearAllFilters = () => {
        setFilters({
            audioPassed: false,
            videoAttended: false,
            audioUploaded: false,
            applicationStatus: 'all',
            experienceRange: 'all',
            salesExperienceRange: 'all',
        });
        setSearchTerm('');
    };

    const hasActiveFilters = () => {
        return filters.audioPassed ||
            filters.videoAttended ||
            filters.audioUploaded ||
            filters.applicationStatus !== 'all' ||
            filters.experienceRange !== 'all' ||
            filters.salesExperienceRange !== 'all' ||
            searchTerm.trim() !== '';
    };

    const FilterContent = () => (
        <>
            {/* Search Bar - Only for Desktop */}
            <div className="mb-6 hidden md:block">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search candidates by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={pageLoading}
                        className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                    {pageLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Application Status Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaUserCheck className="h-4 w-4 text-blue-600" />
                        Application Status
                    </Label>
                    <Select
                        value={filters.applicationStatus}
                        onValueChange={(value) => setFilters({ ...filters, applicationStatus: value })}
                        disabled={pageLoading}
                    >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Total Experience Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaGraduationCap className="h-4 w-4 text-green-600" />
                        Total Experience
                    </Label>
                    <Select
                        value={filters.experienceRange}
                        onValueChange={(value) => setFilters({ ...filters, experienceRange: value })}
                        disabled={pageLoading}
                    >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="All Experience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Experience</SelectItem>
                            <SelectItem value="0-2">0-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sales Experience Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaBriefcase className="h-4 w-4 text-purple-600" />
                        Sales Experience
                    </Label>
                    <Select
                        value={filters.salesExperienceRange}
                        onValueChange={(value) => setFilters({ ...filters, salesExperienceRange: value })}
                        disabled={pageLoading}
                    >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="All Sales Exp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sales Experience</SelectItem>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Interview Status Filters */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaClock className="h-4 w-4 text-orange-600" />
                        Interview Status
                    </Label>
                    <div className="space-y-2">
                        <Button
                            variant={filters.audioPassed ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilters({ ...filters, audioPassed: !filters.audioPassed })}
                            disabled={pageLoading}
                            className="w-full justify-start"
                        >
                            <FaMicrophone className="h-3 w-3 mr-2" />
                            Audio Passed
                        </Button>
                        <Button
                            variant={filters.videoAttended ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilters({ ...filters, videoAttended: !filters.videoAttended })}
                            disabled={pageLoading}
                            className="w-full justify-start"
                        >
                            <FaVideo className="h-3 w-3 mr-2" />
                            Video Attended
                        </Button>
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                <FaSearch className="h-3 w-3" />
                                Search: "{searchTerm}"
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.applicationStatus !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                <FaUserCheck className="h-3 w-3" />
                                {filters.applicationStatus.charAt(0).toUpperCase() + filters.applicationStatus.slice(1)}
                                <button
                                    onClick={() => setFilters({ ...filters, applicationStatus: 'all' })}
                                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.experienceRange !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                <FaGraduationCap className="h-3 w-3" />
                                {filters.experienceRange} years exp
                                <button
                                    onClick={() => setFilters({ ...filters, experienceRange: 'all' })}
                                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.salesExperienceRange !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                <FaBriefcase className="h-3 w-3" />
                                {filters.salesExperienceRange} sales exp
                                <button
                                    onClick={() => setFilters({ ...filters, salesExperienceRange: 'all' })}
                                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.audioPassed && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                <FaMicrophone className="h-3 w-3" />
                                Audio Passed
                                <button
                                    onClick={() => setFilters({ ...filters, audioPassed: false })}
                                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.videoAttended && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                <FaVideo className="h-3 w-3" />
                                Video Attended
                                <button
                                    onClick={() => setFilters({ ...filters, videoAttended: false })}
                                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
                Showing {filteredCount} of {candidatesCount} candidates
                {hasActiveFilters() && (
                    <span className="text-blue-600 font-medium">
                        {' '}(filtered)
                    </span>
                )}
            </div>
        </>
    );

    return (
        <div className="mb-8">
            {/* Desktop Version */}
            <div className="hidden md:block">
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <FaFilter className="text-blue-600 text-xl" />
                            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                        </div>
                        {hasActiveFilters() && (
                            <Button
                                variant="outline"
                                onClick={clearAllFilters}
                                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                disabled={pageLoading}
                            >
                                <FaTimes className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <FilterContent />
                </Card>
            </div>

            {/* Mobile Version */}
            <div className="md:hidden">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <FaFilter className="text-blue-600 text-lg" />
                        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                        {hasActiveFilters() && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {Object.values(filters).filter(v => v !== false && v !== 'all').length + (searchTerm ? 1 : 0)} active
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex items-center gap-2"
                        disabled={pageLoading}
                    >
                        {isMobileMenuOpen ? (
                            <>
                                <FaTimes className="h-4 w-4" />
                                Hide
                            </>
                        ) : (
                            <>
                                <FaBars className="h-4 w-4" />
                                Show
                            </>
                        )}
                    </Button>
                </div>

                {/* Mobile Filter Menu */}
                {isMobileMenuOpen && (
                    <Card className="p-4 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Filter Options</h3>
                            {hasActiveFilters() && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                                    disabled={pageLoading}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                        <FilterContent />
                    </Card>
                )}

                {/* Mobile Search Bar (Always Visible) */}
                <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={pageLoading}
                        className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                    {pageLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>

                {/* Mobile Results Count */}
                <div className="text-sm text-gray-600 mb-4">
                    Showing {filteredCount} of {candidatesCount} candidates
                    {hasActiveFilters() && (
                        <span className="text-blue-600 font-medium">
                            {' '}(filtered)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
} 