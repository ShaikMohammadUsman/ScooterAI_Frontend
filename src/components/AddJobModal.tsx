"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addJobRole } from '@/lib/adminService';
import { toast } from 'sonner';
import { MultiSelect } from "@/components/ui/multi-select";

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
    "United States", "Canada", "Mexico", "Brazil", "Argentina", "Colombia",
    "Chile", "Peru", "United Kingdom", "Germany", "France", "Italy",
    "Spain", "Netherlands", "Sweden", "Switzerland", "Poland", "South Africa",
    "Nigeria", "Egypt", "Kenya", "Morocco", "Ghana", "India", "China", "Japan",
    "South Korea", "Indonesia", "Vietnam", "Thailand", "Philippines",
    "Malaysia", "Australia", "New Zealand", "Fiji", "United Arab Emirates",
    "Saudi Arabia", "Turkey", "Israel", "Qatar"
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

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddJobModal({ isOpen, onClose, onSuccess }: AddJobModalProps) {
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        requirements: {
            sales_type: [] as string[],
            industries: [] as string[],
            regions: [] as string[],
            role_type: '',
            position_level: '',
            crm_tools: [] as string[],
            experience_years: '',
            location: '',
            remote_work: false,
            relocation: false
        }
    });

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        criteria: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            title: '',
            description: '',
            criteria: ''
        };

        // Check title
        if (!newJob.title.trim()) {
            newErrors.title = 'Job title is required';
            isValid = false;
        }

        // Check description
        if (!newJob.description.trim()) {
            newErrors.description = 'Job description is required';
            isValid = false;
        }

        // Count selected criteria
        const selectedCriteria = [
            ...newJob.requirements.sales_type,
            ...newJob.requirements.industries,
            ...newJob.requirements.regions,
            newJob.requirements.role_type,
            newJob.requirements.position_level,
            ...newJob.requirements.crm_tools,
            newJob.requirements.experience_years,
            newJob.requirements.location,
            newJob.requirements.remote_work ? 'Remote Work' : '',
            newJob.requirements.relocation ? 'Open to Relocation' : ''
        ].filter(Boolean);

        if (selectedCriteria.length < 2) {
            newErrors.criteria = 'Please select at least 2 criteria';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRequirementChange = (category: string, value: string | boolean) => {
        setNewJob(prev => {
            const newRequirements = { ...prev.requirements };

            if (category === 'sales_type' || category === 'industries' || category === 'regions' || category === 'crm_tools') {
                const currentValues = newRequirements[category] as string[];
                if (currentValues.includes(value as string)) {
                    newRequirements[category] = currentValues.filter(v => v !== value);
                } else {
                    newRequirements[category] = [...currentValues, value as string];
                }
            } else if (category === 'role_type' || category === 'position_level' || category === 'experience_years' || category === 'location') {
                newRequirements[category] = value as string;
            } else if (category === 'remote_work' || category === 'relocation') {
                newRequirements[category] = value as boolean;
            }

            return {
                ...prev,
                requirements: newRequirements
            };
        });
    };

    const handleRegionChange = (selected: string[]) => {
        setNewJob(prev => ({
            ...prev,
            requirements: {
                ...prev.requirements,
                regions: selected
            }
        }));
    };

    const handleAddJob = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const companyId = localStorage.getItem('company_id');
            if (!companyId) {
                toast.error('Company ID not found');
                return;
            }

            // Convert requirements to badges array
            const badges = [
                ...newJob.requirements.sales_type,
                ...newJob.requirements.industries,
                ...newJob.requirements.regions,
                newJob.requirements.role_type,
                newJob.requirements.position_level,
                ...newJob.requirements.crm_tools,
                `${newJob.requirements.experience_years} years exp`,
                newJob.requirements.location,
                newJob.requirements.remote_work ? 'Remote Work' : '',
                newJob.requirements.relocation ? 'Open to Relocation' : ''
            ].filter(Boolean);

            const response = await addJobRole({
                title: newJob.title,
                description: newJob.description,
                badges,
                company_id: companyId,
            });

            if (response.status) {
                toast.success('Job role added successfully');
                onClose();
                setNewJob({
                    title: '',
                    description: '',
                    requirements: {
                        sales_type: [],
                        industries: [],
                        regions: [],
                        role_type: '',
                        position_level: '',
                        crm_tools: [],
                        experience_years: '',
                        location: '',
                        remote_work: false,
                        relocation: false
                    }
                });
                setErrors({
                    title: '',
                    description: '',
                    criteria: ''
                });
                onSuccess();
            }
        } catch (error) {
            console.error('Error adding job:', error);
            toast.error('Failed to add job role');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-xl font-semibold mb-4">Add New Job Role</h2>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Basic Information</h3>
                        <div>
                            <Label htmlFor="title">Job Title</Label>
                            <Input
                                id="title"
                                value={newJob.title}
                                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                className={errors.title ? 'border-red-500' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                className={errors.description ? 'border-red-500' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Sales Requirements */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Sales Requirements</h3>
                            {errors.criteria && (
                                <p className="text-red-500 text-sm">{errors.criteria}</p>
                            )}
                        </div>
                        <div>
                            <Label>Sales Type</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {salesTypes.map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={type}
                                            checked={newJob.requirements.sales_type.includes(type)}
                                            onCheckedChange={() => handleRequirementChange('sales_type', type)}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={type}>{type}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Industries</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {industries.map(industry => (
                                    <div key={industry} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={industry}
                                            checked={newJob.requirements.industries.includes(industry)}
                                            onCheckedChange={() => handleRequirementChange('industries', industry)}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={industry}>{industry}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Regions</Label>
                            <MultiSelect
                                options={regions}
                                selected={newJob.requirements.regions}
                                onChange={handleRegionChange}
                                placeholder="Select regions..."
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Role Details */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Role Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="roleType">Sales Role Type</Label>
                                <select
                                    id="roleType"
                                    className="w-full p-2 border rounded-md"
                                    value={newJob.requirements.role_type}
                                    onChange={(e) => handleRequirementChange('role_type', e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Role Type</option>
                                    {salesRoleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="positionLevel">Position Level</Label>
                                <select
                                    id="positionLevel"
                                    className="w-full p-2 border rounded-md"
                                    value={newJob.requirements.position_level}
                                    onChange={(e) => handleRequirementChange('position_level', e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Position Level</option>
                                    {positionLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tools & Location */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Tools & Location</h3>
                        <div>
                            <Label>CRM Tools</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {crmTools.map(tool => (
                                    <div key={tool} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={tool}
                                            checked={newJob.requirements.crm_tools.includes(tool)}
                                            onCheckedChange={() => handleRequirementChange('crm_tools', tool)}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={tool}>{tool}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="experience">Years of Experience</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={newJob.requirements.experience_years}
                                    onChange={(e) => handleRequirementChange('experience_years', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newJob.requirements.location}
                                    onChange={(e) => handleRequirementChange('location', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remote"
                                    checked={newJob.requirements.remote_work}
                                    onCheckedChange={(checked) => handleRequirementChange('remote_work', checked)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="remote">Remote Work Available</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="relocation"
                                    checked={newJob.requirements.relocation}
                                    onCheckedChange={(checked) => handleRequirementChange('relocation', checked)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="relocation">Open to Relocation</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleAddJob}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Adding Job...
                                </div>
                            ) : (
                                'Add Job'
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
} 