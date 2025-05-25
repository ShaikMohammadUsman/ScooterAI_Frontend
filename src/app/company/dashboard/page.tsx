"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCompanyJobRoles } from '@/lib/adminService';
import { toast } from 'sonner';
import { FaPlus, FaBriefcase, FaUsers, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import AddJobModal from '@/components/AddJobModal';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobRoles, setJobRoles] = useState<any[]>([]);
    const [showAddJob, setShowAddJob] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        if (!companyId) {
            router.push('/company');
            return;
        }
        fetchJobs(companyId);
    }, []);

    const fetchJobs = async (companyId: string) => {
        try {
            const response = await getCompanyJobRoles(companyId);
            setJobRoles(response.roles);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for charts
    const prepareJobTimelineData = () => {
        const timelineData = jobRoles.reduce((acc: any[], job) => {
            const date = new Date(job.created_at).toLocaleDateString();
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                existingEntry.count++;
            } else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return timelineData;
    };

    const prepareApplicationsData = () => {
        return jobRoles.map(job => ({
            name: job.title,
            applications: job.total_applications || 0
        })).sort((a, b) => b.applications - a.applications).slice(0, 5);
    };

    const prepareStatusDistribution = () => {
        const activeJobs = jobRoles.filter(job => job.is_active).length;
        const inactiveJobs = jobRoles.length - activeJobs;
        return [
            { name: 'Active', value: activeJobs },
            { name: 'Inactive', value: inactiveJobs }
        ];
    };

    const prepareTopRegions = () => {
        const regionCounts = jobRoles.reduce((acc: { [key: string]: number }, job) => {
            job.requirements?.regions?.forEach((region: string) => {
                acc[region] = (acc[region] || 0) + 1;
            });
            return acc;
        }, {});

        return Object.entries(regionCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <Button
                            onClick={() => setShowAddJob(true)}
                            className="flex items-center gap-2"
                        >
                            <FaPlus />
                            Add New Job
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-indigo-100">
                                <FaBriefcase className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Total Jobs</h2>
                                <p className="text-3xl font-bold text-indigo-600">{jobRoles.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <FaCheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
                                <p className="text-3xl font-bold text-green-600">
                                    {jobRoles.filter(job => job.is_active).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100">
                                <FaUsers className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Total Applications</h2>
                                <p className="text-3xl font-bold text-blue-600">
                                    {jobRoles.reduce((acc, job) => acc + (job.total_applications || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Posting Timeline */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Job Posting Timeline</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prepareJobTimelineData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        name="Jobs Posted"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Applications per Job */}
                    {/* <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Top Jobs by Applications</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prepareApplicationsData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="applications" fill="#82ca9d" name="Applications" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card> */}

                    {/* Job Status Distribution */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={prepareStatusDistribution()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {prepareStatusDistribution().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top Regions */}
                    {/* <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Top Regions</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prepareTopRegions()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" name="Job Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card> */}
                </div>
            </div>

            {/* Add Job Modal */}
            <AddJobModal
                isOpen={showAddJob}
                onClose={() => setShowAddJob(false)}
                onSuccess={() => {
                    const companyId = localStorage.getItem('company_id');
                    if (companyId) {
                        fetchJobs(companyId);
                    }
                }}
            />
        </div>
    );
} 