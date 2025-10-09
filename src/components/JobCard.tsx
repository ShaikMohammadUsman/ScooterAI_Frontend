'use client';

import React from 'react';
import { Job } from '@/lib/superAdminService';

interface JobCardProps {
    job: Job;
    showApplyButton?: boolean;
    onApply?: (jobId: string) => void;
    applyButtonText?: string;
    className?: string;
    onClick?: (jobId: string) => void;
}

export default function JobCard({
    job,
    showApplyButton = false,
    onApply,
    applyButtonText = "Apply Now",
    className = "",
    onClick
}: JobCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const formatSalary = (baseSalary: any) => {
        if (!baseSalary || Object.keys(baseSalary).length === 0) return '';

        const { currency, minSalary, maxSalary, cadence } = baseSalary;
        if (!minSalary || !maxSalary) return '';

        return `${currency}${minSalary.toLocaleString()} - ${currency}${maxSalary.toLocaleString()} ${cadence}`;
    };

    const getExperienceText = () => {
        if (job.min_experience === '' && job.max_experience === '') return '';
        if (job.min_experience === job.max_experience) return `${job.min_experience} years`;
        return `${job.min_experience} - ${job.max_experience} years`;
    };

    const handleApply = () => {
        if (onApply) {
            onApply(job.job_id);
        }
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(job.job_id);
        }
    };

    return (
        <div
            className={`p-6 flex flex-col md:grid md:grid-cols-3 gap-6 bg-bg-secondary-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow ${className}`}
            onClick={handleCardClick}
        >

            <div className='md:col-span-2'>
                {/* Header with Posted Date */}
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-cta-primary text-cta-primary-text px-3 py-1 rounded-md text-sm font-medium">
                        Posted: {formatDate(job.created_at)}
                    </div>
                </div>

                {/* Job Title and Company */}
                <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {job.job_title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {job.company_name} · {job.role_type}
                    </p>
                </div>

                {/* Job Details */}
                <div className="mb-4 space-y-2">
                    {job.primary_focus.length > 0 && (
                        <div>
                            <span className="font-semibold text-text-primary">Primary Focus: </span>
                            <span className="text-text-primary">{job.primary_focus.join(', ')}</span>
                        </div>
                    )}

                    {job.sales_process_stages.length > 0 && (
                        <div>
                            <span className="font-semibold text-text-primary">Sales Process: </span>
                            <span className="text-text-primary">{job.sales_process_stages.join(', ')}</span>
                        </div>
                    )}

                    {getExperienceText() && (
                        <div>
                            <span className="font-semibold text-text-primary">Experience: </span>
                            <span className="text-text-primary">{getExperienceText()}</span>
                        </div>
                    )}

                    {formatSalary(job.base_salary) && (
                        <div>
                            <span className="font-semibold text-text-primary">Salary: </span>
                            <span className="text-text-primary">{formatSalary(job.base_salary)}</span>
                        </div>
                    )}

                    {job.work_location && (
                        <div>
                            <span className="font-semibold text-text-primary">Location: </span>
                            <span className="text-text-primary capitalize">{job.work_location}</span>
                            {job.locations.length > 0 && (
                                <span className="text-text-primary"> - {job.locations.join(', ')}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='md:col-span-1 justify-between items-center flex flex-col'>
                {/* Skills and Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {job.skills_required.map((skill, index) => (
                        <span
                            key={index}
                            className="bg-element-3 text-indigo-700 px-2 py-0.5 rounded text-xs"
                        >
                            {skill}
                        </span>
                    ))}
                    {job.primary_focus.map((focus, index) => (
                        <span
                            key={`focus-${index}`}
                            className="bg-element-3 text-indigo-700 px-2 py-0.5 rounded text-xs"
                        >
                            {focus}
                        </span>
                    ))}
                    {job.sales_process_stages.map((stage, index) => (
                        <span
                            key={`stage-${index}`}
                            className="bg-element-3 text-indigo-700 px-2 py-0.5 rounded text-xs"
                        >
                            {stage}
                        </span>
                    ))}
                </div>
                {/* Apply Button */}
                {showApplyButton && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleApply}
                            className="bg-cta-primary hover:bg-cta-primary/90 text-cta-primary-text font-bold py-2 px-6 rounded-md transition-colors"
                        >
                            {applyButtonText}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
