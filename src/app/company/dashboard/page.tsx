"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { fetchJobRoles } from '@/features/jobRoles/jobRolesSlice';
import {
    selectJobRoles,
    selectJobRolesLoading,
    selectJobRolesHasLoaded,
    selectTotalCandidates,
    selectTotalAudioAttended,
    selectTotalVideoAttended,
    selectTotalVideoInvites,
    selectAudioConversionRate,
    selectVideoInviteConversionRate,
    selectVideoCompletionConversionRate
} from '@/features/jobRoles/selectors';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
    FaPlus,
    FaBriefcase,
    FaUsers,
    FaCheckCircle,
    FaChartLine,
    FaMicrophone,
    FaVideo,
    FaArrowUp,
    FaCalendarAlt,
    FaEye,
    FaTable
} from 'react-icons/fa';
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
    Cell,
    AreaChart,
    Area,
    ComposedChart,
    LabelList
} from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { updateJobRoleStatus } from '@/lib/adminService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Custom Tooltip for Funnel
const FunnelTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
                <div className="font-semibold text-gray-800">{data.stage}</div>
                <div className="text-blue-600">Candidates: {data.count.toLocaleString()}</div>
            </div>
        );
    }
    return null;
};

// Custom Tooltip for Conversion Rates
const ConversionRateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const audio = payload.find((p: any) => p.dataKey === 'audioRate');
        const videoInvite = payload.find((p: any) => p.dataKey === 'videoInviteRate');
        const videoCompletion = payload.find((p: any) => p.dataKey === 'videoCompletionRate');
        return (
            <div className="bg-white p-3 rounded shadow text-sm border border-gray-200 min-w-[140px]">
                <div className="font-semibold text-gray-800 mb-1">{label}</div>
                {audio && (
                    <div className="text-green-500">Audio Rate: {audio.value.toFixed(1)}%</div>
                )}
                {videoInvite && (
                    <div className="text-yellow-500">Video Invite Rate: {videoInvite.value.toFixed(1)}%</div>
                )}
                {videoCompletion && (
                    <div className="text-orange-500">Video Completion Rate: {videoCompletion.value.toFixed(1)}%</div>
                )}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const jobRoles = useSelector(selectJobRoles);
    const loading = useSelector(selectJobRolesLoading);
    const hasLoaded = useSelector(selectJobRolesHasLoaded);
    const totalCandidates = useSelector(selectTotalCandidates);
    const totalAudioAttended = useSelector(selectTotalAudioAttended);
    const totalVideoAttended = useSelector(selectTotalVideoAttended);
    const totalVideoInvites = useSelector(selectTotalVideoInvites);
    const audioConversionRate = useSelector(selectAudioConversionRate);
    const videoInviteConversionRate = useSelector(selectVideoInviteConversionRate);
    const videoCompletionConversionRate = useSelector(selectVideoCompletionConversionRate);
    const [showAddJob, setShowAddJob] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        if (!companyId) {
            router.push('/company');
            return;
        }
        // Only fetch if not loading and not already loaded
        if (!loading && !hasLoaded) {
            dispatch(fetchJobRoles(companyId));
        }
    }, [dispatch, loading, hasLoaded, router]);

    // Prepare data for charts
    const prepareCandidateMetricsData = () => {
        return jobRoles.map(job => ({
            name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
            total: job.total_candidates,
            audio: job.audio_attended_count,
            video: job.video_attended_count,
            movedToVideo: job.moved_to_video_round_count
        })).sort((a, b) => b.total - a.total);
    };

    const prepareConversionFunnelData = () => {
        return [
            { stage: 'Total Candidates', count: totalCandidates, color: '#8884d8' },
            { stage: 'Audio Interviews', count: totalAudioAttended, color: '#82ca9d' },
            { stage: 'Final Round Invites', count: totalVideoInvites, color: '#ffc658' },
            { stage: 'Video Interviews', count: totalVideoAttended, color: '#ff7300' }
        ];
    };

    const prepareJobTimelineData = () => {
        const timelineData = jobRoles.reduce((acc: any[], job) => {
            const date = new Date(job.created_at).toLocaleDateString();
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                existingEntry.count++;
                existingEntry.candidates += job.total_candidates;
            } else {
                acc.push({
                    date,
                    count: 1,
                    candidates: job.total_candidates
                });
            }
            return acc;
        }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return timelineData;
    };

    const preparePerformanceComparison = () => {
        return jobRoles.map(job => ({
            name: job.title.length > 12 ? job.title.substring(0, 12) + '...' : job.title,
            audioRate: job.total_candidates > 0 ? ((job.audio_attended_count / job.total_candidates) * 100) : 0,
            videoInviteRate: job.audio_attended_count > 0 ? ((job.moved_to_video_round_count / job.audio_attended_count) * 100) : 0,
            videoCompletionRate: job.moved_to_video_round_count > 0 ? ((job.video_attended_count / job.moved_to_video_round_count) * 100) : 0
        }));
    };

    const prepareMonthlyTrends = () => {
        const monthlyData = jobRoles.reduce((acc: any[], job) => {
            const date = new Date(job.created_at);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const existingEntry = acc.find(entry => entry.month === monthYear);
            if (existingEntry) {
                existingEntry.jobs++;
                existingEntry.candidates += job.total_candidates;
                existingEntry.audioAttended += job.audio_attended_count;
                existingEntry.videoAttended += job.video_attended_count;
            } else {
                acc.push({
                    month: monthYear,
                    jobs: 1,
                    candidates: job.total_candidates,
                    audioAttended: job.audio_attended_count,
                    videoAttended: job.video_attended_count
                });
            }
            return acc;
        }, []).sort((a, b) => a.month.localeCompare(b.month));

        return monthlyData;
    };

    const handleUpdateStatus = async (jobId: string, nextStatus: boolean) => {
        try {
            setUpdatingId(jobId);
            await updateJobRoleStatus({ job_id: jobId, status: nextStatus });
            toast({ title: 'Status updated', description: `Job marked as ${nextStatus ? 'Active' : 'Inactive'}.` });
            const companyId = localStorage.getItem('company_id');
            if (companyId) {
                dispatch(fetchJobRoles(companyId));
            }
        } catch (error: any) {
            toast({ title: 'Failed to update status', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setUpdatingId(null);
        }
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
                            Analytics Dashboard
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
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Candidates</p>
                                <p className="text-3xl font-bold">{totalCandidates.toLocaleString()}</p>
                                <p className="text-blue-200 text-sm mt-1">
                                    Across {jobRoles.length} job roles
                                </p>
                            </div>
                            <FaUsers className="h-8 w-8 text-blue-200" />
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Audio Interviews</p>
                                <p className="text-3xl font-bold">{totalAudioAttended.toLocaleString()}</p>
                                <p className="text-green-200 text-sm mt-1">
                                    {audioConversionRate}% conversion rate
                                </p>
                            </div>
                            <FaMicrophone className="h-8 w-8 text-green-200" />
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Final Round Invites</p>
                                <p className="text-3xl font-bold">{totalVideoInvites.toLocaleString()}</p>
                                <p className="text-purple-200 text-sm mt-1">
                                    {videoInviteConversionRate}% from audio
                                </p>
                            </div>
                            <FaArrowUp className="h-8 w-8 text-purple-200" />
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Video Interviews</p>
                                <p className="text-3xl font-bold">{totalVideoAttended.toLocaleString()}</p>
                                <p className="text-orange-200 text-sm mt-1">
                                    {videoCompletionConversionRate}% from invites
                                </p>
                            </div>
                            <FaVideo className="h-8 w-8 text-orange-200" />
                        </div>
                    </Card>
                </div>

                {/* Conversion Funnel */}
                <Card className="p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaChartLine className="text-blue-600" />
                        Candidate Conversion Funnel
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={prepareConversionFunnelData()}
                                layout="vertical"
                                margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 14 }} />
                                <YAxis type="category" dataKey="stage" tick={{ fontSize: 16, fontWeight: 500 }} width={180} />
                                <Tooltip content={<FunnelTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                <Legend />
                                <Bar dataKey="count" isAnimationActive fill="#8884d8" radius={[0, 8, 8, 0]}>
                                    {prepareConversionFunnelData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList dataKey="count" position="right" formatter={(value: number) => value.toLocaleString()} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Candidate Metrics by Job */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Candidate Metrics by Job Role</h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={prepareCandidateMetricsData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#8884d8" name="Total Candidates" />
                                    <Line type="monotone" dataKey="audio" stroke="#82ca9d" name="Audio Attended" />
                                    <Line type="monotone" dataKey="video" stroke="#ffc658" name="Video Attended" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Performance Comparison */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Conversion Rates by Job Role (%)</h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={preparePerformanceComparison()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip content={<ConversionRateTooltip />} />
                                    <Legend />
                                    <Bar dataKey="audioRate" fill="#82ca9d" name="Audio Rate" />
                                    <Bar dataKey="videoInviteRate" fill="#ffc658" name="Video Invite Rate" />
                                    <Bar dataKey="videoCompletionRate" fill="#ff7300" name="Video Completion Rate" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Monthly Trends */}
                <Card className="p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaCalendarAlt className="text-green-600" />
                        Monthly Trends
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={prepareMonthlyTrends()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="candidates"
                                    stackId="1"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    name="Candidates"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="audioAttended"
                                    stackId="1"
                                    stroke="#82ca9d"
                                    fill="#82ca9d"
                                    name="Audio Attended"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="videoAttended"
                                    stackId="1"
                                    stroke="#ffc658"
                                    fill="#ffc658"
                                    name="Video Attended"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Detailed Analytics Table */}
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaTable className="text-purple-600" />
                        Detailed Job Analytics
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Job Role</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Candidates</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Audio Interviews</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Final Round Invites</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Video Interviews</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Audio Rate</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Invite Rate</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Completion Rate</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobRoles.map((job, index) => {
                                    const audioRate = job.total_candidates > 0 ? ((job.audio_attended_count / job.total_candidates) * 100).toFixed(1) : '0';
                                    const inviteRate = job.audio_attended_count > 0 ? ((job.moved_to_video_round_count / job.audio_attended_count) * 100).toFixed(1) : '0';
                                    const completionRate = job.moved_to_video_round_count > 0 ? ((job.video_attended_count / job.moved_to_video_round_count) * 100).toFixed(1) : '0';
                                    return (
                                        <tr
                                            key={job._id}
                                            className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} cursor-pointer hover:bg-indigo-50 transition`}
                                            onClick={() => router.push(`/company/jobs/${job._id}`)}
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-900">{job.title}</td>
                                            <td className="py-3 px-4 text-center text-gray-700">{job.total_candidates}</td>
                                            <td className="py-3 px-4 text-center text-gray-700">{job.audio_attended_count}</td>
                                            <td className="py-3 px-4 text-center text-gray-700">{job.moved_to_video_round_count}</td>
                                            <td className="py-3 px-4 text-center text-gray-700">{job.video_attended_count}</td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge variant={parseFloat(audioRate) > 50 ? "default" : "secondary"}>
                                                    {audioRate}%
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge variant={parseFloat(inviteRate) > 30 ? "default" : "secondary"}>
                                                    {inviteRate}%
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge variant={parseFloat(completionRate) > 50 ? "default" : "secondary"}>
                                                    {completionRate}%
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Badge variant={job.is_active ? "default" : "destructive"}>
                                                        {job.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="outline" disabled={updatingId === job._id}>
                                                                {updatingId === job._id ? 'Updating...' : 'Set Status'}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className='bg-white' align="end">
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateStatus(job._id, true); }}>
                                                                Mark Active
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleUpdateStatus(job._id, false); }}>
                                                                Mark Inactive
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Add Job Modal */}
            <AddJobModal
                isOpen={showAddJob}
                onClose={() => setShowAddJob(false)}
                onSuccess={() => {
                    const companyId = localStorage.getItem('company_id');
                    if (companyId) {
                        dispatch(fetchJobRoles(companyId));
                    }
                }}
            />
        </div>
    );
} 