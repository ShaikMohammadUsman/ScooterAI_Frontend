"use client";

import React, { useState } from 'react';
import { getCompanyJobRolesWithTimeRange } from '@/lib/adminService';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TimeframeTest() {
    const [fromTime, setFromTime] = useState('');
    const [toTime, setToTime] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testEndpoint = async () => {
        setLoading(true);
        try {
            const response = await getCompanyJobRolesWithTimeRange(
                "6833e6384946844df0a22a2e",
                fromTime || undefined,
                toTime || undefined
            );
            setResult(response);
        } catch (error: any) {
            setResult({ error: error?.message || String(error) || "Unknown error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4">Timeframe Endpoint Test</h2>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="fromTime">From Time (optional)</Label>
                    <Input
                        id="fromTime"
                        type="datetime-local"
                        value={fromTime}
                        onChange={(e) => setFromTime(e.target.value)}
                        placeholder="Leave empty for no start time"
                    />
                </div>

                <div>
                    <Label htmlFor="toTime">To Time (optional)</Label>
                    <Input
                        id="toTime"
                        type="datetime-local"
                        value={toTime}
                        onChange={(e) => setToTime(e.target.value)}
                        placeholder="Leave empty for current time"
                    />
                </div>

                <Button
                    onClick={testEndpoint}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? 'Testing...' : 'Test Endpoint'}
                </Button>
            </div>

            {result && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Result:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </Card>
    );
}
