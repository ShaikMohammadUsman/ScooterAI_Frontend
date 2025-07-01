"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { searchProfiles, SearchProfilesResponse, Profile } from '@/lib/adminService';
import { toast } from "@/hooks/use-toast";
import { FaSearch, FaVideo, FaMicrophone, FaExternalLinkAlt, FaCheck } from 'react-icons/fa';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const salesTypes = [
    "Consultative Sales",
    "Channel Sales",
    "Direct Sales",
    "Inside Sales",
    "Outside Sales",
    "Technical Sales"
];

const industries = [
    "Healthcare",
    "Textiles",
    "Technology",
    "Manufacturing",
    "Finance",
    "Retail"
];

const regions = [
    "New Jersey",
    "New York",
    "California",
    "Texas",
    "Florida",
    "Illinois"
];

const salesRoleTypes = [
    "Executive",
    "Manager",
    "Representative",
    "Specialist",
    "Consultant"
];

const positionLevels = [
    "Entry",
    "Mid",
    "Senior",
    "Lead",
    "Manager"
];

const crmTools = [
    "Salesforce.com",
    "HubSpot",
    "Microsoft Dynamics",
    "Zoho CRM",
    "Pipedrive"
];

export default function CandidateSearch() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [exactMatch, setExactMatch] = useState(true);
    const [searchResponse, setSearchResponse] = useState<SearchProfilesResponse>({
        total_matches: 0,
        job_id: null,
        profiles: []
    });
    const [searchParams, setSearchParams] = useState({
        basic_information: {
            current_location: '',
            open_to_relocation: false
        },
        career_overview: {
            total_years_experience: 0,
            years_sales_experience: 0
        },
        sales_context: {
            sales_type: '',
            industries_sold_into: [] as string[],
            regions_sold_into: [] as string[]
        },
        role_process_exposure: {
            sales_role_type: '',
            position_level: ''
        },
        tools_platforms: {
            crm_used: [] as string[]
        }
    });

    const handleSearch = async () => {
        setLoading(true);
        try {
            const paramsToSend = {
                ...searchParams,
                sales_context: {
                    ...searchParams.sales_context,
                    sales_type: searchParams.sales_context.sales_type || undefined
                }
            };
            const response = await searchProfiles(paramsToSend, exactMatch);
            setSearchResponse(response);
        } catch (error) {
            console.error('Error searching candidates:', error);
            toast({
                title: "Error",
                description: "Failed to search candidates",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (category: string, value: string, checked: boolean) => {
        setSearchParams(prev => {
            const newParams = { ...prev };
            if (category === 'sales_context.sales_type') {
                newParams.sales_context.sales_type = checked ? value : '';
            } else if (category === 'sales_context.industries_sold_into') {
                newParams.sales_context.industries_sold_into = checked
                    ? [...prev.sales_context.industries_sold_into, value]
                    : prev.sales_context.industries_sold_into.filter(v => v !== value);
            } else if (category === 'sales_context.regions_sold_into') {
                newParams.sales_context.regions_sold_into = checked
                    ? [...prev.sales_context.regions_sold_into, value]
                    : prev.sales_context.regions_sold_into.filter(v => v !== value);
            } else if (category === 'tools_platforms.crm_used') {
                newParams.tools_platforms.crm_used = checked
                    ? [...prev.tools_platforms.crm_used, value]
                    : prev.tools_platforms.crm_used.filter(v => v !== value);
            }
            return newParams;
        });
    };

    const getCommunicationChartData = (scores: any) => {
        return [
            { subject: 'Content & Thought', A: scores.content_and_thought.score },
            { subject: 'Verbal Delivery', A: scores.verbal_delivery.score },
            { subject: 'Non-Verbal', A: scores.non_verbal.score },
            { subject: 'Presence & Authenticity', A: scores.presence_and_authenticity.score }
        ];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Candidate Search
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters */}
                    <Card className="p-6 lg:col-span-1">
                        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>

                        {/* Basic Information */}
                        <div className="space-y-4 mb-6">
                            <h3 className="font-medium">Basic Information</h3>
                            <div>
                                <Label htmlFor="location">Current Location</Label>
                                <Input
                                    id="location"
                                    value={searchParams?.basic_information?.current_location}
                                    onChange={(e) => setSearchParams(prev => ({
                                        ...prev,
                                        basic_information: {
                                            ...prev.basic_information,
                                            current_location: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="relocation"
                                    checked={searchParams?.basic_information?.open_to_relocation}
                                    onCheckedChange={(checked) => setSearchParams(prev => ({
                                        ...prev,
                                        basic_information: {
                                            ...prev.basic_information,
                                            open_to_relocation: checked as boolean
                                        }
                                    }))}
                                />
                                <Label htmlFor="relocation">Open to Relocation</Label>
                            </div>
                        </div>

                        {/* Career Overview */}
                        <div className="space-y-4 mb-6">
                            <h3 className="font-medium">Career Overview</h3>
                            <div>
                                <Label htmlFor="totalExperience">Total Years Experience</Label>
                                <Input
                                    id="totalExperience"
                                    type="number"
                                    value={searchParams?.career_overview?.total_years_experience}
                                    onChange={(e) => setSearchParams(prev => ({
                                        ...prev,
                                        career_overview: {
                                            ...prev.career_overview,
                                            total_years_experience: parseFloat(e.target.value)
                                        }
                                    }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="salesExperience">Years Sales Experience</Label>
                                <Input
                                    id="salesExperience"
                                    type="number"
                                    value={searchParams?.career_overview?.years_sales_experience}
                                    onChange={(e) => setSearchParams(prev => ({
                                        ...prev,
                                        career_overview: {
                                            ...prev.career_overview,
                                            years_sales_experience: parseFloat(e.target.value)
                                        }
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Sales Context */}
                        <div className="space-y-4 mb-6">
                            <h3 className="font-medium">Sales Context</h3>
                            <div>
                                <Label htmlFor="salesType">Sales Type</Label>
                                <Select
                                    value={searchParams?.sales_context?.sales_type}
                                    onValueChange={(value) => setSearchParams(prev => ({
                                        ...prev,
                                        sales_context: {
                                            ...prev.sales_context,
                                            sales_type: value
                                        }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Sales Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salesTypes?.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Industries</Label>
                                <div className="space-y-2 mt-2">
                                    {industries.map(industry => (
                                        <div key={industry} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={industry}
                                                checked={searchParams?.sales_context?.industries_sold_into?.includes(industry)}
                                                onCheckedChange={(checked) => handleCheckboxChange('sales_context.industries_sold_into', industry, checked as boolean)}
                                            />
                                            <Label htmlFor={industry}>{industry}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>Regions</Label>
                                <div className="space-y-2 mt-2">
                                    {regions.map(region => (
                                        <div key={region} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={region}
                                                checked={searchParams?.sales_context?.regions_sold_into?.includes(region)}
                                                onCheckedChange={(checked) => handleCheckboxChange('sales_context.regions_sold_into', region, checked as boolean)}
                                            />
                                            <Label htmlFor={region}>{region}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Role Process Exposure */}
                        <div className="space-y-4 mb-6">
                            <h3 className="font-medium">Role Process Exposure</h3>
                            <div>
                                <Label htmlFor="roleType">Sales Role Type</Label>
                                <select
                                    id="roleType"
                                    className="w-full p-2 border rounded-md"
                                    value={searchParams?.role_process_exposure?.sales_role_type}
                                    onChange={(e) => setSearchParams(prev => ({
                                        ...prev,
                                        role_process_exposure: {
                                            ...prev.role_process_exposure,
                                            sales_role_type: e.target.value
                                        }
                                    }))}
                                >
                                    <option value="">Select Role Type</option>
                                    {salesRoleTypes?.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="positionLevel">Position Level</Label>
                                <select
                                    id="positionLevel"
                                    className="w-full p-2 border rounded-md"
                                    value={searchParams?.role_process_exposure?.position_level}
                                    onChange={(e) => setSearchParams(prev => ({
                                        ...prev,
                                        role_process_exposure: {
                                            ...prev.role_process_exposure,
                                            position_level: e.target.value
                                        }
                                    }))}
                                >
                                    <option value="">Select Position Level</option>
                                    {positionLevels?.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tools & Platforms */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Tools & Platforms</h3>
                            <div>
                                <Label>CRM Tools</Label>
                                <div className="space-y-2 mt-2">
                                    {crmTools.map(tool => (
                                        <div key={tool} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={tool}
                                                checked={searchParams?.tools_platforms?.crm_used?.includes(tool)}
                                                onCheckedChange={(checked) => handleCheckboxChange('tools_platforms.crm_used', tool, checked as boolean)}
                                            />
                                            <Label htmlFor={tool}>{tool}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center justify-center gap-2">
                                <Label htmlFor="exact-match" className="text-sm">
                                    Exact Match
                                </Label>
                                <Switch
                                    className="bg-blue-300"
                                    id="exact-match"
                                    checked={exactMatch}
                                    onCheckedChange={setExactMatch}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full mt-6"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search Candidates'}
                        </Button>
                    </Card>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Search Results ({searchResponse?.total_matches} matches)
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {searchResponse?.profiles.map((candidate: Profile) => (
                                <Card key={candidate?._id} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {candidate?.basic_information?.full_name}
                                            </h3>
                                            <p className="text-gray-600">
                                                {candidate?.basic_information?.current_location}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-sm text-gray-500">
                                                    {candidate?.career_overview.total_years_experience} years exp
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-sm text-gray-500">
                                                    {candidate?.career_overview.years_sales_experience} years sales
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {candidate?.audio_interview && (
                                                <span className="flex items-center gap-2 p-2 text-green-600 bg-green-50 rounded-full">
                                                    <FaMicrophone /> <FaCheck />
                                                </span>
                                            )}
                                            {candidate?.video_url && (
                                                <span
                                                    className="flex items-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-full cursor-pointer"
                                                    onClick={() => window.open(candidate?.video_url || undefined, '_blank')}
                                                >
                                                    <FaVideo /> <FaExternalLinkAlt className="ml-1" />
                                                </span>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedProfile(candidate)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {searchResponse.profiles.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No candidates found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Details Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        {selectedProfile?.basic_information?.full_name}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        {selectedProfile?.basic_information?.current_location}
                                    </p>
                                    {selectedProfile?.basic_information?.languages_spoken && selectedProfile?.basic_information?.languages_spoken?.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {selectedProfile?.basic_information?.languages_spoken?.map((lang: string, index: number) => (
                                                <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Match Score:</span>
                                        <span className="px-2 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                            {selectedProfile?.match_score}/10
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setSelectedProfile(null)}
                                        className="text-gray-50 hover:text-white hover:bg-red-700 bg-red-500"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>

                            {/* Career Overview */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Overview</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Experience</p>
                                        <p className="text-lg font-semibold">{selectedProfile?.career_overview.total_years_experience} years</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Sales Experience</p>
                                        <p className="text-lg font-semibold">{selectedProfile?.career_overview.years_sales_experience} years</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Avg. Tenure</p>
                                        <p className="text-lg font-semibold">{selectedProfile?.career_overview.average_tenure_per_role} years</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Notice Period</p>
                                        <p className="text-lg font-semibold">
                                            {selectedProfile?.basic_information?.notice_period_days || selectedProfile?.basic_information?.notice_period || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Company History */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Company History</h4>
                                <div className="space-y-3">
                                    {selectedProfile?.career_overview.company_history.map((company, index: number) => (
                                        <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{company?.position}</h5>
                                                <p className="text-gray-600">{company?.company_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(company?.start_date).toLocaleDateString()} - {company?.is_current ? 'Present' : (company?.end_date ? new Date(company?.end_date).toLocaleDateString() : 'Not specified')}
                                                </p>
                                                <p className="text-sm text-gray-500">{company?.duration_months} months</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Communication Assessment */}
                            {selectedProfile?.communication_scores && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Communication Assessment</h4>

                                    {/* Radar Chart */}
                                    <div className="h-80 mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={getCommunicationChartData(selectedProfile?.communication_scores)}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                                <Radar
                                                    name="Score"
                                                    dataKey="A"
                                                    stroke="#4F46E5"
                                                    fill="#4F46E5"
                                                    fillOpacity={0.3}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Detailed Scores */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedProfile?.communication_scores).map(([key, value]) => {
                                            if (key === 'overall_score') return null;
                                            const score = value as { score: number; feedback: string };
                                            return (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className="font-medium text-gray-900 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </h5>
                                                        <span className="px-2 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                                            {score?.score}/5
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{score?.feedback}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-medium text-indigo-900">Overall Score</h5>
                                            <span className="px-3 py-1 text-lg font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                                {selectedProfile?.communication_scores?.overall_score}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                {selectedProfile?.video_url && (
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onClick={() => window.open(selectedProfile?.video_url || undefined, '_blank')}
                                    >
                                        <FaExternalLinkAlt className="mr-2" />
                                        Watch Video Interview
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
} 