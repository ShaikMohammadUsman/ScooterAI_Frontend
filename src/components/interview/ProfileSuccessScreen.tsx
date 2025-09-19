import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Headphones, Mic, RotateCcw, Info, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startAudioCall } from '@/lib/interviewService'
import { toast } from '@/hooks/use-toast'

function ProfileSuccessScreen({ handleStartInterview }: { handleStartInterview: () => void }) {
    const router = useRouter();
    const [isCalling, setIsCalling] = useState(false);

    const handleGetCall = async () => {
        setIsCalling(true);
        try {
            const profileId = localStorage.getItem('scooterUserId');
            if (!profileId) {
                toast({
                    title: "Error",
                    description: "No profile ID found. Please complete your profile first.",
                    variant: "destructive"
                });
                return;
            }

            const response = await startAudioCall({ profile_id: profileId });

            if (response.status && response.call_details.status === "success") {
                toast({
                    title: "Call Initiated Successfully!",
                    description: "You will receive a call soon. Please keep your phone ready.",
                    variant: "default"
                });
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to initiate call. Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error("Error starting audio call:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to initiate call. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCalling(false);
        }
    };

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
                        We'll call you shortly to have a brief conversation with 2–3 quick questions so hiring teams can hear how you think, speak, and sell.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        This helps you stand out early and get a response quicker.
                    </p>

                    {/* Features Grid */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50">
                            <Clock className="w-6 h-6 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-blue-700">Takes 3-5 minutes</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
                            <Phone className="w-6 h-6 text-purple-600 mb-2" />
                            <span className="text-sm font-medium text-purple-700">We'll call you</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-orange-50">
                            <RotateCcw className="w-6 h-6 text-orange-600 mb-2" />
                            <span className="text-sm font-medium text-orange-700">You can re-record</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50">
                            <Mic className="w-6 h-6 text-green-600 mb-2" />
                            <span className="text-sm font-medium text-green-700">No video required, only voice</span>
                        </div>
                    </div> */}

                    {/* Phone Call Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h4 className="font-medium text-yellow-800 mb-1">📞 We'll Call You Soon</h4>
                                <p className="text-sm text-yellow-700">
                                    Make sure your phone is ready and you're in a quiet environment. We'll call you within the next few minutes to have a quick chat.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call Timing Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h4 className="font-medium text-blue-800 mb-1">What to expect?</h4>
                                <p className="text-sm text-blue-700">
                                    Our team member will call you shortly. Please answer the call and be ready to discuss your experience and answer a few questions about the role.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                    <Button
                        onClick={handleGetCall}
                        disabled={isCalling}
                        className="h-12 px-10 sm:px-12 text-lg sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-primary text-white hover:bg-primary/90"
                    >
                        {isCalling ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Initiating Call...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Get Call
                            </div>
                        )}
                    </Button>

                    <Button
                        onClick={() => router.push('/interview/practice')}
                        variant="outline"
                        className="h-12 px-10 sm:px-12 text-lg sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-blue-600 text-blue-700 hover:bg-blue-50"
                    >
                        Practice First
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProfileSuccessScreen
