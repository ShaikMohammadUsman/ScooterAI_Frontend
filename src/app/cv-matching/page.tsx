'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { listReports, uploadResumesZip, ReportsListResponse, UploadResumesResponse } from '@/lib/cvMatchingService'
import LoadingSpinner from '@/components/ui/loadingSpinner'

export default function CvMatchingPage() {
    const [zipFile, setZipFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [reportName, setReportName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<ReportsListResponse['reports']>([])
    const [loadingReports, setLoadingReports] = useState(false)

    const canSubmit = useMemo(() => !!zipFile && jobDescription.trim().length > 0 && reportName.trim().length > 0 && !submitting, [zipFile, jobDescription, reportName, submitting])

    const fetchReports = async () => {
        setLoadingReports(true)
        try {
            const data = await listReports()
            setReports(data.reports)
        } catch (e: any) {
            setError(e.message || 'Failed to load reports')
        } finally {
            setLoadingReports(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!zipFile) return
        setSubmitting(true)
        setError(null)
        try {
            const res = await uploadResumesZip({ zip_file: zipFile, job_description: jobDescription, name: reportName })
            if ((res as any).detail) {
                setError((res as any).detail)
            } else {
                await fetchReports()
                setZipFile(null)
                setJobDescription('')
                setReportName('')
            }
        } catch (e: any) {
            setError(e.message || 'Upload failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6">Job CV Matching</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Upload Resumes (ZIP)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="zip">ZIP file</Label>
                                    <Input id="zip" type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
                                </div>
                                <div>
                                    <Label htmlFor="name">Report Name</Label>
                                    <Input id="name" placeholder="e.g., analysis 7" value={reportName} onChange={(e) => setReportName(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="jd">Job Description</Label>
                                <textarea id="jd" className="w-full border rounded-md px-3 py-2 min-h-[120px]" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the target job description here" />
                            </div>
                            {error && (
                                <div className="text-sm text-red-600">{error}</div>
                            )}
                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={!canSubmit}>
                                    {submitting ? 'Uploading...' : 'Upload & Analyze'}
                                </Button>
                                <span className="text-xs text-gray-500">Only .zip containing PDF resumes is supported.</span>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Past Analyses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingReports ? (
                            <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map((r) => (
                                    <div key={r._id} className="border rounded-md p-4 bg-white flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{r.name}</div>
                                            <Badge variant="secondary">{new Date(r.created_at).toLocaleString()}</Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-end">
                                            <Link className="text-blue-600 hover:underline" href={`/cv-matching/${r._id}`}>View Results</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


