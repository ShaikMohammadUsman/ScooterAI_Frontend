'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getReportDetails, ReportDetailsResponse } from '@/lib/cvMatchingService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown';

export default function CvMatchingDetailsPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params?.id as string
    const [data, setData] = useState<ReportDetailsResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const run = async () => {
            if (!id) return
            setLoading(true)
            setError(null)
            try {
                const res = await getReportDetails(id)
                setData(res)
            } catch (e: any) {
                setError(e.message || 'Failed to load report')
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [id])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Analysis Result</h1>
                    <Button variant="outline" onClick={() => router.push('/cv-matching')}>Back</Button>
                </div>

                {loading && <div>Loading...</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}

                {data && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{data.name}</span>
                                <span className="text-sm text-gray-500">{new Date(data.created_at).toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-600 mb-4">Status: {data.status}</div>
                            <Separator className="my-4" />
                            <div className="space-y-6">
                                {data.assessments.map((a, idx) => (
                                    <div key={idx} className="border rounded-md p-4 bg-white">
                                        <div className="font-medium mb-2">{a.file_name}</div>
                                        <ReactMarkdown >{a.job_fit_assessment}</ReactMarkdown>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}


