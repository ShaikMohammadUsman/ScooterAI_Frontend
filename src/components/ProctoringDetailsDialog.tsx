"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaClock, FaPlay, FaStop, FaEye, FaEyeSlash, FaMousePointer, FaKeyboard, FaMobile, FaDesktop, FaMicrophone, FaVideo } from 'react-icons/fa';
import { Candidate } from '@/lib/adminService';

interface ProctoringDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate | null;
}

export default function ProctoringDetailsDialog({ isOpen, onOpenChange, candidate }: ProctoringDetailsDialogProps) {
    if (!candidate?.video_proctoring_details && !candidate?.audio_proctoring_details) {
        return null;
    }

    const hasVideoProctoring = !!candidate?.video_proctoring_details;
    const hasAudioProctoring = !!candidate?.audio_proctoring_details;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FaEye className="text-blue-600" />
                        Proctoring Details
                    </DialogTitle>
                    <DialogDescription>
                        Real-time monitoring data captured during interview sessions
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={hasVideoProctoring ? "video" : "audio"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        {hasVideoProctoring && (
                            <TabsTrigger value="video" className="flex items-center gap-2">
                                <FaVideo className="text-blue-600" />
                                Video Interview
                            </TabsTrigger>
                        )}
                        {hasAudioProctoring && (
                            <TabsTrigger value="audio" className="flex items-center gap-2">
                                <FaMicrophone className="text-green-600" />
                                Audio Interview
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Video Proctoring Tab */}
                    {hasVideoProctoring && (
                        <TabsContent value="video" className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FaVideo className="text-blue-600" />
                                    Video Session Overview
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaDesktop className="text-blue-500" />
                                            Screen Time
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {String((candidate?.video_proctoring_details as any)["screen time"] ?? '0')}s
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMousePointer className="text-blue-500" />
                                            Tab Switches
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.video_proctoring_details?.tab_switches}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaEyeSlash className="text-blue-500" />
                                            Focus Loss
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.video_proctoring_details?.window_focus_loss}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMousePointer className="text-blue-500" />
                                            Right Clicks
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.video_proctoring_details?.right_clicks}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaKeyboard className="text-red-500" />
                                            Dev Tools
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.video_proctoring_details?.dev_tools_attempts}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Touch Gestures
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.video_proctoring_details?.multi_touch_gestures}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Swipe Gestures
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.video_proctoring_details?.swipe_gestures}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Orientation
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.video_proctoring_details?.orientation_changes}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaClock className="text-blue-500" />
                                            Total Duration
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.video_proctoring_details?.interview_duration}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Video Timeline Events */}
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaClock className="text-gray-600" />
                                    Video Session Timeline
                                </h3>
                                <ScrollArea className="h-80 w-full">
                                    <div className="space-y-3">
                                        {candidate?.video_proctoring_details?.interview_events?.length ? (
                                            candidate?.video_proctoring_details?.interview_events
                                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                .map((evt, idx) => {
                                                    const eventTime = new Date(evt.timestamp);
                                                    const timeString = eventTime.toLocaleTimeString('en-US', {
                                                        hour12: false,
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    });
                                                    const isStart = evt.event.includes('started');
                                                    const isEnd = evt.event.includes('ended');
                                                    const isQuestion = evt.event.includes('question');
                                                    const isResponse = evt.event.includes('response');

                                                    return (
                                                        <div key={idx} className="relative">
                                                            {/* Timeline connector */}
                                                            {Array.isArray(candidate?.video_proctoring_details?.interview_events) &&
                                                                idx < (candidate?.video_proctoring_details?.interview_events.length - 1) && (
                                                                    <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-300"></div>
                                                                )
                                                            }

                                                            <div className="flex items-start gap-4">
                                                                {/* Event icon */}
                                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isStart ? 'bg-green-100 text-green-600' :
                                                                    isEnd ? 'bg-red-100 text-red-600' :
                                                                        isQuestion ? 'bg-blue-100 text-blue-600' :
                                                                            isResponse ? 'bg-purple-100 text-purple-600' :
                                                                                'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {isStart ? <FaPlay className="text-sm" /> :
                                                                        isEnd ? <FaStop className="text-sm" /> :
                                                                            isQuestion ? <FaMicrophone className="text-sm" /> :
                                                                                isResponse ? <FaVideo className="text-sm" /> :
                                                                                    <FaClock className="text-sm" />
                                                                    }
                                                                </div>

                                                                {/* Event content */}
                                                                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium text-gray-900 capitalize">
                                                                            {evt.event.replace(/_/g, ' ')}
                                                                        </h4>
                                                                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                                            {timeString}
                                                                        </span>
                                                                    </div>

                                                                    {evt.details && Object.keys(evt.details).length > 0 && (
                                                                        <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-200">
                                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Details:</h5>
                                                                            <div className="space-y-1">
                                                                                {Object.entries(evt.details).map(([key, value]) => {
                                                                                    // Skip timestamp since we already show time on top right
                                                                                    if (key === 'timestamp') return null;

                                                                                    return (
                                                                                        <div key={key} className="flex items-center gap-2 text-xs">
                                                                                            <span className="font-medium text-gray-600 capitalize">
                                                                                                {key.replace(/_/g, ' ')}:
                                                                                            </span>
                                                                                            <span className="text-gray-700">
                                                                                                {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FaClock className="mx-auto text-4xl text-gray-300 mb-2" />
                                                <p>No video proctoring events recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    )}

                    {/* Audio Proctoring Tab */}
                    {hasAudioProctoring && (
                        <TabsContent value="audio" className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FaMicrophone className="text-green-600" />
                                    Audio Session Overview
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaDesktop className="text-green-500" />
                                            Screen Time
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {String((candidate?.audio_proctoring_details as any)["screen time"] ?? '0')}s
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMousePointer className="text-green-500" />
                                            Tab Switches
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.audio_proctoring_details?.tab_switches}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaEyeSlash className="text-green-500" />
                                            Focus Loss
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.audio_proctoring_details?.window_focus_loss}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMousePointer className="text-green-500" />
                                            Right Clicks
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {candidate?.audio_proctoring_details?.right_clicks}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaKeyboard className="text-red-500" />
                                            Dev Tools
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.audio_proctoring_details?.dev_tools_attempts}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Touch Gestures
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.audio_proctoring_details?.multi_touch_gestures}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Swipe Gestures
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.audio_proctoring_details?.swipe_gestures}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaMobile className="text-green-500" />
                                            Orientation
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.audio_proctoring_details?.orientation_changes}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaClock className="text-green-500" />
                                            Total Duration
                                        </p>
                                        <p className="text-sm font-semibold">{candidate?.audio_proctoring_details?.interview_duration}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Audio Timeline Events */}
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaClock className="text-gray-600" />
                                    Audio Session Timeline
                                </h3>
                                <ScrollArea className="h-80 w-full">
                                    <div className="space-y-3">
                                        {candidate?.audio_proctoring_details?.interview_events?.length ? (
                                            candidate?.audio_proctoring_details?.interview_events
                                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                .map((evt, idx) => {
                                                    const eventTime = new Date(evt.timestamp);
                                                    const timeString = eventTime.toLocaleTimeString('en-US', {
                                                        hour12: false,
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    });
                                                    const isStart = evt.event.includes('started');
                                                    const isEnd = evt.event.includes('ended');
                                                    const isQuestion = evt.event.includes('question');
                                                    const isResponse = evt.event.includes('response');

                                                    return (
                                                        <div key={idx} className="relative">
                                                            {/* Timeline connector */}
                                                            {Array.isArray(candidate?.audio_proctoring_details?.interview_events) &&
                                                                idx < (candidate?.audio_proctoring_details?.interview_events.length - 1) && (
                                                                    <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-300"></div>
                                                                )
                                                            }

                                                            <div className="flex items-start gap-4">
                                                                {/* Event icon */}
                                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isStart ? 'bg-green-100 text-green-600' :
                                                                    isEnd ? 'bg-red-100 text-red-600' :
                                                                        isQuestion ? 'bg-blue-100 text-blue-600' :
                                                                            isResponse ? 'bg-purple-100 text-purple-600' :
                                                                                'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {isStart ? <FaPlay className="text-sm" /> :
                                                                        isEnd ? <FaStop className="text-sm" /> :
                                                                            isQuestion ? <FaMicrophone className="text-sm" /> :
                                                                                isResponse ? <FaMicrophone className="text-sm" /> :
                                                                                    <FaClock className="text-sm" />
                                                                    }
                                                                </div>

                                                                {/* Event content */}
                                                                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium text-gray-900 capitalize">
                                                                            {evt.event.replace(/_/g, ' ')}
                                                                        </h4>
                                                                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                                            {timeString}
                                                                        </span>
                                                                    </div>

                                                                    {evt.details && Object.keys(evt.details).length > 0 && (
                                                                        <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-green-200">
                                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Details:</h5>
                                                                            <div className="space-y-1">
                                                                                {Object.entries(evt.details).map(([key, value]) => {
                                                                                    // Skip timestamp since we already show time on top right
                                                                                    if (key === 'timestamp') return null;

                                                                                    return (
                                                                                        <div key={key} className="flex items-center gap-2 text-xs">
                                                                                            <span className="font-medium text-gray-600 capitalize">
                                                                                                {key.replace(/_/g, ' ')}:
                                                                                            </span>
                                                                                            <span className="text-gray-700">
                                                                                                {typeof value === 'string' ? value : JSON.stringify(value)}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FaClock className="mx-auto text-4xl text-gray-300 mb-2" />
                                                <p>No audio proctoring events recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
