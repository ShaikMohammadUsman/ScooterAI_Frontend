"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Monitor,
    Smartphone,
    X,
    AlertTriangle,
    CheckCircle,
    Info
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SystemAudioInstructionsProps {
    // Display mode
    variant?: 'static' | 'popup' | 'floating';

    // Content customization
    title?: string;
    description?: string;
    showTitle?: boolean;

    // Layout customization
    compact?: boolean;
    showImages?: boolean;

    // Theme
    isDarkTheme?: boolean;

    // Popup specific
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    // Floating specific
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

    // Actions
    onClose?: () => void;
    showCloseButton?: boolean;

    // Custom styling
    className?: string;

    // Tabbed platform instructions
    platformTabs?: boolean;
    defaultPlatform?: 'windows' | 'macos' | 'other';
}

const SystemAudioInstructions: React.FC<SystemAudioInstructionsProps> = ({
    variant = 'static',
    title = "Allow Screen Sharing with System Audio",
    description = "Please follow these steps to include both your microphone and the system voice (question narration) in your recording.",
    showTitle = true,
    compact = false,
    showImages = true,
    isDarkTheme = false,
    open = false,
    onOpenChange,
    position = 'center',
    onClose,
    showCloseButton = false,
    className = "",
    platformTabs = true,
    defaultPlatform
}) => {
    const [preview, setPreview] = React.useState<{ open: boolean; src: string; alt: string }>({ open: false, src: "", alt: "" });

    const openPreview = (src: string, alt: string) => setPreview({ open: true, src, alt });
    const closePreview = () => setPreview((p) => ({ ...p, open: false }));
    const baseClasses = `transition-all duration-1000 ease-in-out ${isDarkTheme
        ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/50'
        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
        }`;

    const contentClasses = compact
        ? `p-3 md:p-4 rounded-lg border ${baseClasses}`
        : `p-4 md:p-6 rounded-xl border ${baseClasses}`;

    const titleClasses = `${compact ? 'text-sm md:text-base' : 'text-base md:text-lg'} font-semibold mb-2 md:mb-4 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-blue-300' : 'text-blue-900'
        }`;

    const descriptionClasses = `${isDarkTheme ? 'text-blue-200' : 'text-blue-800'} ${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'} mb-4`;

    const stepClasses = `${isDarkTheme ? 'text-blue-100' : 'text-blue-900'} ${compact ? 'text-xs' : 'text-sm'} space-y-2`;

    const imageClasses = `flex justify-center items-center mt-2 rounded-md overflow-hidden border border-gray-200 ${compact ? 'max-w-xs h-36' : 'w-full h-40 md:h-48'}`;

    const detectDefaultPlatform = (): 'windows' | 'macos' | 'other' => {
        if (defaultPlatform) return defaultPlatform;
        try {
            const ua = navigator.userAgent || '';
            if (/Windows/i.test(ua)) return 'windows';
            if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
            return 'other';
        } catch {
            return 'other';
        }
    };

    const renderTabbedContent = () => (
        <Tabs defaultValue={detectDefaultPlatform()} className="w-full">
            <TabsList className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                <TabsTrigger value="windows">Windows</TabsTrigger>
                <TabsTrigger value="macos">macOS</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="windows">
                <div className={`rounded-lg p-3 md:p-4  ${isDarkTheme ? 'bg-blue-900/10' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4" />
                        <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'}`}>Windows (Chrome/Edge)</h4>
                    </div>
                    <div className={`grid grid-cols-1 lg:grid-cols-3 auto-rows-fr items-stretch gap-4 ${stepClasses}`}>
                        <div className="flex flex-col h-full">
                            <div className="font-semibold mb-1">1. Select "Entire Screen".</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/selectEntireScreen.png', 'Windows - Select Entire Screen')}>
                                    <img
                                        src="/assets/images/selectEntireScreen.png"
                                        alt="Windows - Select Entire Screen"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col h-full">
                            <div className="font-semibold mb-1">2. Choose the desktop/window to share.</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/selectWindow.png', 'Windows - Select Window')}>
                                    <img
                                        src="/assets/images/selectWindow.png"
                                        alt="Windows - Select Window"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col h-full">
                            <div className="font-semibold mb-1">3. Check "Share audio".</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/allowAudio.png', 'Windows - Allow System Audio')}>
                                    <img
                                        src="/assets/images/allowAudio.png"
                                        alt="Windows - Allow System Audio"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-3">
                            <div className="font-semibold">4. Click "Share".</div>
                        </div>
                    </div>
                    <div className={`mt-3 ${compact ? 'text-xs' : 'text-xs'} ${isDarkTheme ? 'text-blue-300/90' : 'text-blue-700'}`}>
                        Tip: If you don't see the audio checkbox, select "Entire Screen".
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="macos">
                <div className={`rounded-lg p-3 md:p-4 ${isDarkTheme ? 'bg-blue-900/10' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4" />
                        <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'}`}>macOS (Chrome preferred)</h4>
                    </div>
                    <div className={`grid grid-cols-1 lg:grid-cols-3 auto-rows-fr items-stretch gap-4 ${stepClasses}`}>
                        <div className="flex flex-col justify-between h-full">
                            <div className="font-semibold mb-1">1. Allow Chrome in System Settings → Privacy & Security → Screen Recording and Microphone.</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/macAllowChromeAccess.png', 'macOS - Allow Chrome in Screen Recording and Microphone')}>
                                    <img
                                        src="/assets/images/macAllowChromeAccess.png"
                                        alt="macOS - Allow Chrome in Screen Recording and Microphone"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-between h-full">
                            <div className="font-semibold mb-1">2. In the share prompt, go to the "Entire Screen" tab.</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/macGoToEntireScreenTab.png', 'macOS - Go to Entire Screen tab')}>
                                    <img
                                        src="/assets/images/macGoToEntireScreenTab.png"
                                        alt="macOS - Go to Entire Screen tab"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-between h-full">
                            <div className="font-semibold mb-1">3. Select the screen tile you want to share.</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/macSelectEntireScreen.png', 'macOS - Select screen to share')}>
                                    <img
                                        src="/assets/images/macSelectEntireScreen.png"
                                        alt="macOS - Select screen to share"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-between h-full">
                            <div className="font-semibold mb-1">4. Check "Share audio".</div>
                            {showImages && (
                                <div className={`${imageClasses} cursor-zoom-in`} onClick={() => openPreview('/assets/images/macShareSystemAudio.png', 'macOS - Enable Share audio')}>
                                    <img
                                        src="/assets/images/macShareSystemAudio.png"
                                        alt="macOS - Enable Share audio"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-3">
                            <div className="font-semibold">5. Click "Share".</div>
                        </div>
                        <div className="lg:col-span-3">
                            <div className="font-semibold mb-1">6. If you don't see the audio checkbox, enable the Chrome flag and restart Chrome:</div>
                            <div className={`mt-2 rounded-md p-2 md:p-3 ${isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'} ${compact ? 'text-xs' : 'text-sm'}`}>
                                chrome://flags/#mac-system-audio-loopback → Enable → Relaunch
                            </div>
                        </div>
                    </div>
                    <div className={`mt-3 ${compact ? 'text-xs' : 'text-xs'} ${isDarkTheme ? 'text-blue-300/90' : 'text-blue-700'}`}>
                        Note: Safari/Firefox do not reliably support system audio capture.
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="other">
                <div className={`rounded-lg p-3 md:p-4  ${isDarkTheme ? 'bg-blue-900/10' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4" />
                        <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${isDarkTheme ? 'text-blue-200' : 'text-blue-800'}`}>Other devices</h4>
                    </div>
                    <div className={`${stepClasses}`}>
                        Use Chrome/Chromium and select "Entire Screen", then check "Share audio". If the option isn't available, system audio may not be supported by your OS or policy.
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );

    const renderContent = () => (
        <div className={contentClasses}>
            {showTitle && (
                <h3 className={titleClasses}>
                    <Shield className="w-4 h-4 md:w-5 md:h-5" />
                    {title}
                </h3>
            )}

            <p className={descriptionClasses}>
                {description}
            </p>
            {platformTabs ? (
                renderTabbedContent()
            ) : (
                <div className={`mt-4 ${compact ? 'text-xs' : 'text-xs'} ${isDarkTheme ? 'text-blue-300/90' : 'text-blue-700'}`}>
                    Other devices (Linux/Chromebooks): use Chrome/Chromium and select "Entire Screen", then check "Share audio".
                    If the option isn't available, system audio may not be supported by your OS or policy.
                </div>
            )}

            {showCloseButton && onClose && (
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        size={compact ? "sm" : "default"}
                        className={`${isDarkTheme
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Close
                    </Button>
                </div>
            )}
        </div>
    );

    // Floating variant
    if (variant === 'floating') {
        const positionClasses = {
            'top-left': 'top-4 left-4',
            'top-right': 'top-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        };

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`fixed z-50 max-w-md ${positionClasses[position]} ${className}`}
                >
                    <Card className={`shadow-2xl border-0 ${isDarkTheme ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className={`text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                    System Audio Setup
                                </CardTitle>
                                {showCloseButton && onClose && (
                                    <Button
                                        onClick={onClose}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {renderContent()}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Popup variant
    if (variant === 'popup') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
                    <DialogHeader>
                        <DialogTitle className={`text-xl ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            System Audio Setup Instructions
                        </DialogTitle>
                        <DialogDescription className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Follow these steps to enable system audio capture for your interview recording.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {renderContent()}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Static variant (default)
    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className={className}
            >
                {renderContent()}
            </motion.div>

            {/* Image preview dialog */}
            <Dialog open={preview.open} onOpenChange={(o) => (o ? setPreview((p) => ({ ...p, open: true })) : closePreview())}>
                <DialogContent className="max-w-5xl p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle className="text-base">{preview.alt}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[70vh] flex items-center justify-center bg-black/80">
                        {preview.src && (
                            <img src={preview.src} alt={preview.alt} className="max-w-full max-h-full object-contain" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SystemAudioInstructions;
