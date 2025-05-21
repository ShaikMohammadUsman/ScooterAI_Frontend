"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw } from "lucide-react"

export function StudyTimer() {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1)
            }, 1000)
        } else if (interval) {
            clearInterval(interval)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning])

    const handleStartStop = () => {
        setIsRunning(!isRunning)
    }

    const handleReset = () => {
        setTime(0)
        setIsRunning(false)
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Study Timer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold mb-4 text-center" aria-live="polite">
                    {formatTime(time)}
                </div>
                <div className="flex justify-center space-x-2">
                    <Button onClick={handleStartStop}>
                        {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isRunning ? "Pause" : "Start"}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}