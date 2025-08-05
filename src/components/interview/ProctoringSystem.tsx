"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, AlertTriangle, X, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ProctoringSystemProps {
    isActive: boolean;
    onViolation: (violation: string) => void;
}

interface Violation {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    severity: 'warning' | 'critical';
    details?: string;
}

export default function ProctoringSystem({ isActive, onViolation }: ProctoringSystemProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isWatching, setIsWatching] = useState(false);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [windowFocusCount, setWindowFocusCount] = useState(0);
    const [rightClickCount, setRightClickCount] = useState(0);
    const [devToolsCount, setDevToolsCount] = useState(0);
    const [multiTouchCount, setMultiTouchCount] = useState(0);
    const [swipeGestureCount, setSwipeGestureCount] = useState(0);
    const [orientationChangeCount, setOrientationChangeCount] = useState(0);
    const [lastActivity, setLastActivity] = useState<Date>(new Date());
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [activityLog, setActivityLog] = useState<string[]>([]);
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [showCompactCard, setShowCompactCard] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const [screenHeight, setScreenHeight] = useState(0);

    // Check if browser supports fullscreen
    const isFullscreenSupported = () => {
        return document.fullscreenEnabled ||
            (document as any).webkitFullscreenEnabled ||
            (document as any).mozFullScreenEnabled ||
            (document as any).msFullscreenEnabled;
    };

    // Detect iOS device
    const isIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    };

    // Detect Safari browser
    const isSafari = () => {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    // Enter fullscreen
    const enterFullscreen = async () => {
        try {
            // Check if already in fullscreen
            if (document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement) {
                setIsFullscreen(true);
                return;
            }

            // Check if fullscreen is supported and enabled
            if (!isFullscreenSupported()) {
                console.log("Fullscreen not supported or disabled");
                return;
            }

            // Try to enter fullscreen with proper error handling
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                await (document.documentElement as any).webkitRequestFullscreen();
            } else if ((document.documentElement as any).mozRequestFullScreen) {
                await (document.documentElement as any).mozRequestFullScreen();
            } else if ((document.documentElement as any).msRequestFullscreen) {
                await (document.documentElement as any).msRequestFullscreen();
            } else {
                console.log("No fullscreen API available");
                return;
            }

            setIsFullscreen(true);
        } catch (error: any) {
            console.error("Failed to enter fullscreen:", error);

            // Don't add violation for common fullscreen failures
            if (error.name === 'NotAllowedError' ||
                error.name === 'TypeError' ||
                error.message?.includes('user gesture')) {
                console.log("Fullscreen blocked - requires user gesture or not allowed");
            } else {
                addViolation("fullscreen", "Failed to enter fullscreen mode", "warning");
            }
        }
    };

    // Exit fullscreen
    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
            setIsFullscreen(false);
        } catch (error) {
            console.error("Failed to exit fullscreen:", error);
        }
    };

    // Add violation
    const addViolation = useCallback((type: string, message: string, severity: 'warning' | 'critical' = 'warning', details?: string) => {
        const violation: Violation = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: new Date(),
            severity,
            details
        };

        setViolations(prev => [...prev, violation]);
        onViolation(message);

        // Log activity
        const logEntry = `${new Date().toLocaleTimeString()} - ${type.toUpperCase()}: ${message}`;
        setActivityLog(prev => [...prev.slice(-50), logEntry]); // Keep last 50 entries

        // Show warning toast
        toast({
            title: severity === 'critical' ? "Proctoring Alert" : "Proctoring Warning",
            description: message,
            variant: severity === 'critical' ? "destructive" : "default",
        });

        // Show warning modal for critical violations
        if (severity === 'critical') {
            setWarningMessage(message);
            setShowWarning(true);
        }
    }, [onViolation]);

    // Monitor fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement);

            setIsFullscreen(isCurrentlyFullscreen);

            if (!isCurrentlyFullscreen && isActive) {
                addViolation("fullscreen", "Fullscreen mode was exited", "critical");
            }
        };

        // Safari-specific fullscreen detection
        const handleSafariFullscreenChange = () => {
            if (isSafari()) {
                const isCurrentlyFullscreen = !!(document as any).webkitFullscreenElement;
                setIsFullscreen(isCurrentlyFullscreen);

                if (!isCurrentlyFullscreen && isActive) {
                    addViolation("fullscreen", "Fullscreen mode was exited", "critical");
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleSafariFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleSafariFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [isActive, addViolation]);

    // Monitor tab visibility and page unload
    useEffect(() => {
        let hiddenTime: number | null = null;
        const maxHiddenTime = 5000; // 5 seconds
        let tabSwitchStartTime: number | null = null;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                hiddenTime = Date.now();
                tabSwitchStartTime = Date.now();
                setTabSwitchCount(prev => prev + 1);
                addViolation("tab_switch", "Tab was switched or minimized", "warning", "User switched to another tab or minimized the window");
            } else {
                if (hiddenTime && Date.now() - hiddenTime > maxHiddenTime) {
                    addViolation("tab_switch", "Tab was hidden for too long", "critical", `Tab was inactive for ${Math.round((Date.now() - hiddenTime) / 1000)} seconds`);
                }
                hiddenTime = null;
                tabSwitchStartTime = null;
            }
        };

        // Monitor page unload attempts
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            addViolation("page_unload", "Page unload attempt detected", "critical", "User attempted to close or navigate away from the page");
            e.preventDefault();
            e.returnValue = "Interview in progress. Please do not close this window.";
            return "Interview in progress. Please do not close this window.";
        };

        // Monitor page visibility API
        const handlePageShow = () => {
            if (tabSwitchStartTime) {
                const duration = Date.now() - tabSwitchStartTime;
                if (duration > maxHiddenTime) {
                    addViolation("tab_switch", "Extended tab switch detected", "warning", `Tab was switched for ${Math.round(duration / 1000)} seconds`);
                }
                tabSwitchStartTime = null;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [addViolation]);

    // Monitor window focus and activity
    useEffect(() => {
        let focusLostTime: number | null = null;
        const maxFocusLostTime = 3000; // 3 seconds

        const handleWindowBlur = () => {
            focusLostTime = Date.now();
            setWindowFocusCount(prev => prev + 1);
            addViolation("window_focus", "Window lost focus", "warning", "User switched to another window or application");
        };

        const handleWindowFocus = () => {
            setLastActivity(new Date());

            if (focusLostTime && Date.now() - focusLostTime > maxFocusLostTime) {
                addViolation("window_focus", "Window was out of focus for too long", "critical", `Window was inactive for ${Math.round((Date.now() - focusLostTime) / 1000)} seconds`);
            }
            focusLostTime = null;
        };

        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [addViolation]);

    // Monitor keyboard shortcuts and right-click
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block common shortcuts that could be used to cheat (Windows/Linux and Mac)
            const blockedShortcuts = [
                // Windows/Linux shortcuts
                { key: 'F11', description: 'F11 (Fullscreen toggle)' },
                { key: 'Escape', description: 'Escape key' },
                { key: 'Alt+Tab', description: 'Alt+Tab (Window switching)' },
                { key: 'Ctrl+Tab', description: 'Ctrl+Tab (Tab switching)' },
                { key: 'Ctrl+W', description: 'Ctrl+W (Close tab)' },
                { key: 'Ctrl+N', description: 'Ctrl+N (New window)' },
                { key: 'Ctrl+T', description: 'Ctrl+T (New tab)' },
                { key: 'F5', description: 'F5 (Refresh)' },
                { key: 'Ctrl+R', description: 'Ctrl+R (Refresh)' },
                { key: 'Ctrl+Shift+R', description: 'Ctrl+Shift+R (Hard refresh)' },
                { key: 'F12', description: 'F12 (Developer Tools)' },
                { key: 'Ctrl+Shift+I', description: 'Ctrl+Shift+I (Developer Tools)' },
                { key: 'Ctrl+Shift+J', description: 'Ctrl+Shift+J (Console)' },
                { key: 'Ctrl+U', description: 'Ctrl+U (View Source)' },

                // Mac-specific shortcuts
                { key: 'Meta+Tab', description: 'Cmd+Tab (App switching)' },
                { key: 'Meta+`', description: 'Cmd+` (Window switching)' },
                { key: 'Meta+W', description: 'Cmd+W (Close tab)' },
                { key: 'Meta+N', description: 'Cmd+N (New window)' },
                { key: 'Meta+T', description: 'Cmd+T (New tab)' },
                { key: 'Meta+R', description: 'Cmd+R (Refresh)' },
                { key: 'Meta+Shift+R', description: 'Cmd+Shift+R (Hard refresh)' },
                { key: 'Meta+Shift+I', description: 'Cmd+Shift+I (Developer Tools)' },
                { key: 'Meta+Shift+J', description: 'Cmd+Shift+J (Console)' },
                { key: 'Meta+U', description: 'Cmd+U (View Source)' },
                { key: 'Meta+Option+I', description: 'Cmd+Option+I (Developer Tools)' },
                { key: 'Meta+Option+J', description: 'Cmd+Option+J (Console)' },
                { key: 'Meta+Option+C', description: 'Cmd+Option+C (Console)' },
                { key: 'Meta+Option+U', description: 'Cmd+Option+U (View Source)' },
                { key: 'Meta+Shift+C', description: 'Cmd+Shift+C (Inspect Element)' },
                { key: 'Meta+Shift+E', description: 'Cmd+Shift+E (Extensions)' },
                { key: 'Meta+Shift+G', description: 'Cmd+Shift+G (Go to Line)' },
                { key: 'Meta+Shift+P', description: 'Cmd+Shift+P (Command Palette)' },
                { key: 'Meta+Shift+D', description: 'Cmd+Shift+D (Toggle Device Toolbar)' },
                { key: 'Meta+Shift+M', description: 'Cmd+Shift+M (Toggle Device Toolbar)' },
                { key: 'Meta+Shift+O', description: 'Cmd+Shift+O (Console)' },
                { key: 'Meta+Shift+S', description: 'Cmd+Shift+S (Search in Files)' },
                { key: 'Meta+Shift+F', description: 'Cmd+Shift+F (Search in Files)' },
                { key: 'Meta+Shift+H', description: 'Cmd+Shift+H (Search in Files)' },
                { key: 'Meta+Shift+L', description: 'Cmd+Shift+L (Search in Files)' },
                { key: 'Meta+Shift+K', description: 'Cmd+Shift+K (Search in Files)' },
                { key: 'Meta+Shift+Z', description: 'Cmd+Shift+Z (Redo)' },
                { key: 'Meta+Shift+Y', description: 'Cmd+Shift+Y (Redo)' },
                { key: 'Meta+Shift+X', description: 'Cmd+Shift+X (Cut)' },
                { key: 'Meta+Shift+C', description: 'Cmd+Shift+C (Copy)' },
                { key: 'Meta+Shift+V', description: 'Cmd+Shift+V (Paste)' },
                { key: 'Meta+Shift+A', description: 'Cmd+Shift+A (Select All)' },
                { key: 'Meta+Shift+Z', description: 'Cmd+Shift+Z (Undo)' },
                { key: 'Meta+Shift+F', description: 'Cmd+Shift+F (Find)' },
                { key: 'Meta+Shift+G', description: 'Cmd+Shift+G (Find Next)' },
                { key: 'Meta+Shift+H', description: 'Cmd+Shift+H (Find Previous)' },
                { key: 'Meta+Shift+L', description: 'Cmd+Shift+L (Find Selection)' },
                { key: 'Meta+Shift+K', description: 'Cmd+Shift+K (Find Selection)' },
                { key: 'Meta+Shift+O', description: 'Cmd+Shift+O (Find Selection)' },
                { key: 'Meta+Shift+P', description: 'Cmd+Shift+P (Find Selection)' },
                { key: 'Meta+Shift+Q', description: 'Cmd+Shift+Q (Find Selection)' },
                { key: 'Meta+Shift+R', description: 'Cmd+Shift+R (Find Selection)' },
                { key: 'Meta+Shift+S', description: 'Cmd+Shift+S (Find Selection)' },
                { key: 'Meta+Shift+T', description: 'Cmd+Shift+T (Find Selection)' },
                { key: 'Meta+Shift+U', description: 'Cmd+Shift+U (Find Selection)' },
                { key: 'Meta+Shift+V', description: 'Cmd+Shift+V (Find Selection)' },
                { key: 'Meta+Shift+W', description: 'Cmd+Shift+W (Find Selection)' },
                { key: 'Meta+Shift+X', description: 'Cmd+Shift+X (Find Selection)' },
                { key: 'Meta+Shift+Y', description: 'Cmd+Shift+Y (Find Selection)' },
                { key: 'Meta+Shift+Z', description: 'Cmd+Shift+Z (Find Selection)' },
            ];

            const pressedKeys = [];
            if (e.ctrlKey) pressedKeys.push('Ctrl');
            if (e.metaKey) pressedKeys.push('Meta'); // Cmd key on Mac
            if (e.altKey) pressedKeys.push('Alt');
            if (e.shiftKey) pressedKeys.push('Shift');
            if (e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Shift') {
                pressedKeys.push(e.key);
            }

            const pressedCombo = pressedKeys.join('+');

            const blocked = blockedShortcuts.find(shortcut =>
                shortcut.key === pressedCombo || shortcut.key === e.key
            );

            if (blocked) {
                e.preventDefault();
                addViolation("keyboard", `Blocked shortcut: ${blocked.description}`, "warning", `Attempted to use ${blocked.description}`);
            }
        };

        // Prevent right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setRightClickCount(prev => prev + 1);
            addViolation("right_click", "Right-click context menu blocked", "warning", "Right-click context menu was prevented");
        };

        // Detect developer tools
        const detectDevTools = () => {
            const devtools = {
                open: false,
                orientation: null as string | null
            };

            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    setDevToolsCount(prev => prev + 1);
                    addViolation("dev_tools", "Developer tools detected", "critical", "Developer tools window was opened");
                }
            } else {
                devtools.open = false;
            }
        };

        if (isActive) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('contextmenu', handleContextMenu);

            // Check for dev tools every 500ms
            const devToolsInterval = setInterval(detectDevTools, 500);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('contextmenu', handleContextMenu);
                clearInterval(devToolsInterval);
            };
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isActive, addViolation]);

    // Monitor mouse/touch activity and iOS-specific events
    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;
        const inactivityThreshold = 120000; // 2 minutes

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                addViolation("inactivity", "No activity detected for 2 minutes", "warning");
            }, inactivityThreshold);
        };

        const handleActivity = () => {
            setLastActivity(new Date());
            resetInactivityTimer();
        };

        // iOS-specific touch events
        const handleTouchStart = (e: TouchEvent) => {
            handleActivity();
            // Monitor for multi-touch gestures that could indicate app switching
            if (e.touches.length > 1) {
                setMultiTouchCount(prev => prev + 1);
                addViolation("multi_touch", "Multi-touch gesture detected", "warning", "Multi-touch gesture may indicate app switching");
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            handleActivity();
            // Monitor for swipe gestures that could indicate app switching
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const startY = touch.clientY;
                const startX = touch.clientX;

                // Detect horizontal swipes that might be app switching gestures
                if (Math.abs(touch.clientX - startX) > 100) {
                    setSwipeGestureCount(prev => prev + 1);
                    addViolation("swipe_gesture", "Horizontal swipe gesture detected", "warning", "Swipe gesture may indicate app switching");
                }
            }
        };

        // Monitor orientation changes (iOS)
        const handleOrientationChange = () => {
            setOrientationChangeCount(prev => prev + 1);
            addViolation("orientation_change", "Device orientation changed", "warning", "Device orientation change detected");
        };

        if (isActive) {
            // Standard activity monitoring
            document.addEventListener('mousemove', handleActivity);
            document.addEventListener('mousedown', handleActivity);
            document.addEventListener('keydown', handleActivity);
            document.addEventListener('scroll', handleActivity);

            // iOS-specific monitoring
            if (isIOS()) {
                document.addEventListener('touchstart', handleTouchStart);
                document.addEventListener('touchmove', handleTouchMove);
                window.addEventListener('orientationchange', handleOrientationChange);

                // Monitor for iOS-specific gestures
                document.addEventListener('gesturestart', () => {
                    addViolation("ios_gesture", "iOS gesture detected", "warning", "iOS-specific gesture detected");
                });

                document.addEventListener('gesturechange', () => {
                    addViolation("ios_gesture", "iOS gesture in progress", "warning", "iOS gesture in progress");
                });
            }

            resetInactivityTimer();
        }

        return () => {
            document.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('mousedown', handleActivity);
            document.removeEventListener('keydown', handleActivity);
            document.removeEventListener('scroll', handleActivity);

            if (isIOS()) {
                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('orientationchange', handleOrientationChange);
                document.removeEventListener('gesturestart', () => { });
                document.removeEventListener('gesturechange', () => { });
            }

            clearTimeout(inactivityTimer);
        };
    }, [isActive, addViolation]);

    // Start proctoring when interview starts
    useEffect(() => {
        if (isActive && !isWatching) {
            setIsWatching(true);

            // Auto-enter fullscreen if supported (with better timing)
            if (isFullscreenSupported() && !isFullscreen) {
                // Use a longer delay to ensure DOM is ready and user gesture context is established
                setTimeout(() => {
                    enterFullscreen();
                }, 1500);
            }

            toast({
                title: "Proctoring Active",
                description: "Your interview session is now being monitored. Please stay focused and avoid switching tabs or windows.",
                variant: "default",
            });
        }
    }, [isActive, isWatching, isFullscreen]);

    // Stop proctoring when interview ends
    useEffect(() => {
        if (!isActive && isWatching) {
            setIsWatching(false);
            if (isFullscreen) {
                exitFullscreen();
            }
        }
    }, [isActive, isWatching, isFullscreen]);

    // Close compact card when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showCompactCard && !target.closest('.proctoring-icon') && !target.closest('.proctoring-card')) {
                setShowCompactCard(false);
            }
        };

        if (showCompactCard) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCompactCard]);

    // Random blinking animation for active monitoring
    useEffect(() => {
        if (!isActive || !isWatching) return;

        const startBlinking = () => {
            // Random interval between 25-60 seconds
            const randomInterval = Math.random() * 35000 + 25000; // 25-60 seconds

            setTimeout(() => {
                if (isActive && isWatching) {
                    setIsBlinking(true);

                    // Blink for 1 second
                    setTimeout(() => {
                        setIsBlinking(false);
                        // Schedule next blink
                        startBlinking();
                    }, 1000);
                }
            }, randomInterval);
        };

        startBlinking();

        return () => {
            setIsBlinking(false);
        };
    }, [isActive, isWatching]);

    // Get screen height for animation
    useEffect(() => {
        const updateScreenHeight = () => {
            setScreenHeight(window.innerHeight);
        };

        updateScreenHeight();
        window.addEventListener('resize', updateScreenHeight);

        return () => {
            window.removeEventListener('resize', updateScreenHeight);
        };
    }, []);

    // Trigger fly-in animation when proctoring starts
    useEffect(() => {
        if (isActive) {
            console.log("Proctoring activated - animation should trigger");
            setHasAnimatedIn(true);
        } else {
            setHasAnimatedIn(false);
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <>
            {/* Compact Proctoring Icon */}
            <div className="fixed top-4 right-4 z-50">
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            key={`proctoring-icon-${isActive}`}
                            initial={{
                                y: screenHeight - 100, // Start from bottom of screen
                                scale: 0.1,
                                opacity: 0,
                                rotate: -45,
                                x: 50
                            }}
                            animate={{
                                y: 0,
                                scale: 1,
                                opacity: 1,
                                rotate: 0,
                                x: 0
                            }}
                            exit={{
                                y: screenHeight - 100,
                                scale: 0.1,
                                opacity: 0,
                                rotate: 45,
                                x: -50
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 10,
                                duration: 2,
                                delay: 0.3,
                                bounce: 0.4
                            }}
                            className="relative"
                        >
                            <motion.div
                                animate={isBlinking ? {
                                    scale: [1, 1.3, 1],
                                    boxShadow: [
                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        "0 10px 15px -3px rgba(239, 68, 68, 0.4)",
                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                    ]
                                } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <Button
                                    onClick={() => setShowCompactCard(!showCompactCard)}
                                    variant="ghost"
                                    size="icon"
                                    className={`w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 shadow-lg relative proctoring-icon transition-all duration-200 flex items-center justify-center ${isBlinking ? 'shadow-xl ring-2 ring-red-400 bg-red-100' : ''
                                        } ${hasAnimatedIn ? 'ring-4 ring-red-300 ring-opacity-50' : ''}`}
                                >
                                    {/* Status indicator dot */}
                                    <motion.div
                                        className={`w-2 h-2 rounded-full ${isWatching ? 'bg-green-500' : 'bg-red-500'} absolute -top-1 -right-1 z-10`}
                                        animate={isWatching ? {
                                            scale: [1, 1.3, 1],
                                            opacity: [1, 0.7, 1]
                                        } : {}}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <Eye className="w-5 h-5 text-red-600" />
                                    {violations.length > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500 }}
                                        >
                                            <Badge className="absolute -top-2 -left-2 w-5 h-5 p-0 text-xs text-center items-center justify-center bg-red-500 text-white">
                                                {violations.length}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Compact Proctoring Card */}
            {showCompactCard && (
                <div className="fixed top-16 right-4 z-50 proctoring-card">
                    <Card className="w-72 shadow-lg border-red-200 bg-red-50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${isWatching ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <CardTitle className="text-sm font-semibold text-red-800">
                                        Proctoring Active
                                    </CardTitle>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {isFullscreen ? 'Fullscreen' : 'Windowed'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 text-xs text-red-700">
                                <div className="flex items-center justify-between">
                                    <span>Tab Switches:</span>
                                    <span className="font-semibold">{tabSwitchCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Window Focus Loss:</span>
                                    <span className="font-semibold">{windowFocusCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Right Clicks:</span>
                                    <span className="font-semibold">{rightClickCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Dev Tools Attempts:</span>
                                    <span className="font-semibold">{devToolsCount}</span>
                                </div>
                                {isIOS() && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span>Multi-touch Gestures:</span>
                                            <span className="font-semibold">{multiTouchCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Swipe Gestures:</span>
                                            <span className="font-semibold">{swipeGestureCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Orientation Changes:</span>
                                            <span className="font-semibold">{orientationChangeCount}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center justify-between">
                                    <span>Total Violations:</span>
                                    <span className="font-semibold">{violations.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Last Activity:</span>
                                    <span className="font-semibold">
                                        {lastActivity.toLocaleTimeString()}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => setShowActivityLog(true)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 text-xs"
                                >
                                    View Activity Log
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96 shadow-2xl border-red-300">
                        <CardHeader className="bg-red-50 border-b border-red-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <CardTitle className="text-red-800">Proctoring Violation</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-red-700 mb-4">{warningMessage}</p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={() => setShowWarning(false)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Acknowledge
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Activity Log Modal */}
            {showActivityLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-[600px] max-h-[500px] shadow-2xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Activity Log</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowActivityLog(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="max-h-[400px] overflow-y-auto space-y-1">
                                {activityLog.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No activity logged yet</p>
                                ) : (
                                    activityLog.map((log, index) => (
                                        <div key={index} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-red-400">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Fullscreen Prompt */}
            {isActive && !isFullscreen && isFullscreenSupported() && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-96 shadow-2xl">
                        <CardHeader className="bg-blue-50 border-b border-blue-200">
                            <div className="flex items-center gap-2">
                                <Maximize className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-blue-800">Fullscreen Required</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-gray-700 mb-4">
                                For security purposes, the interview must be conducted in fullscreen mode.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={enterFullscreen}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Enter Fullscreen
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
} 