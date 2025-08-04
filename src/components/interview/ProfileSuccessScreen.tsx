import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Headphones, Mic, RotateCcw, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

function ProfileSuccessScreen({ handleStartInterview }: { handleStartInterview: () => void }) {
    const router = useRouter();
    return (
        <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Congrats! You've made it to the next step
                    </h1>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                    <p className="text-xl text-gray-700 leading-relaxed mb-6">
                        Your profile looks strong!
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Now you have to answer 2–3 short questions in your own voice so hiring teams can hear how you think, speak, and sell.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        This helps you stand out early and get a response quicker.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50">
                            <Clock className="w-6 h-6 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-blue-700">Takes 3-5 minutes</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
                            <Headphones className="w-6 h-6 text-purple-600 mb-2" />
                            <span className="text-sm font-medium text-purple-700">Headphones recommended</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-orange-50">
                            <RotateCcw className="w-6 h-6 text-orange-600 mb-2" />
                            <span className="text-sm font-medium text-orange-700">You can re-record</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50">
                            <Mic className="w-6 h-6 text-green-600 mb-2" />
                            <span className="text-sm font-medium text-green-700">No video required, only voice</span>
                        </div>
                    </div>

                    {/* Resume Later Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h4 className="font-medium text-blue-800 mb-1">Need to take a break?</h4>
                                <p className="text-sm text-blue-700">
                                    You can resume this audio interview later by refreshing this page and using the same email address. Your progress will be saved automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                    <Button
                        onClick={handleStartInterview}
                        className="h-14 px-12 text-xl font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        Start Real Interview
                    </Button>

                    <Button
                        onClick={() => router.push('/interview/practice')}
                        variant="outline"
                        className="h-12 px-8 text-lg font-medium"
                    >
                        Practice First (Mock Interview)
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProfileSuccessScreen