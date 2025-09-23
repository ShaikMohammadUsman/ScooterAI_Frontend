"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaExclamationTriangle, FaRegEye, FaCheck } from "react-icons/fa";

type BrowserWarningModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetUrl?: string; // optional URL to open/copy instead of current page
};

function getChromeDeepLink(currentUrl: string): string | null {
    try {
        const url = new URL(currentUrl);
        const isHttps = url.protocol === "https:";
        // Desktop Chrome deep link (best-effort)
        const desktop = `${isHttps ? "googlechrome://" : "googlechrome://"}${url.host}${url.pathname}${url.search}${url.hash}`;
        // Android intent fallback
        const android = `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=${isHttps ? "https" : "http"};package=com.android.chrome;end`;
        // iOS does not allow switching browsers reliably; keep desktop form as best-effort
        // Return both by preference, caller can try open() then fallback
        return `${desktop}|||${android}`;
    } catch {
        return null;
    }
}

export default function BrowserWarningModal({ open, onOpenChange, targetUrl }: BrowserWarningModalProps) {
    const [showHelp, setShowHelp] = React.useState(false);
    const [currentUrl, setCurrentUrl] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            const fullUrl = targetUrl
                ? `${window.location.origin}${targetUrl}`
                : window.location.href;
            setCurrentUrl(fullUrl);
            setShowHelp(false);
        }
    }, [open, targetUrl]);

    const handleOpenInChrome = React.useCallback(() => {
        const ua = navigator.userAgent || "";
        const isAndroid = /Android/i.test(ua);

        // Construct full URL for targetUrl
        const fullUrl = targetUrl
            ? `${window.location.origin}${targetUrl}`
            : window.location.href;

        const link = getChromeDeepLink(fullUrl);
        if (!link) return;
        const [desktop, android] = link.split("|||");

        if (isAndroid) {
            // Android supports intent:// to open Chrome directly
            window.location.href = android;
            return;
        }

        // Desktop: googlechrome:// is often blocked or unregistered. Try once, then fallback.
        const before = document.visibilityState;
        try {
            // Attempt deep link
            window.location.href = desktop;
        } catch { }
        // Fallback shortly after: show instructions and copy URL for easy paste
        setTimeout(() => {
            if (document.visibilityState === before) {
                try {
                    navigator.clipboard?.writeText(fullUrl).catch(() => { });
                } catch { }
                setShowHelp(true);
            }
        }, 600);
    }, [targetUrl]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center justify-center mb-2">
                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                            <FaExclamationTriangle className="w-7 h-7 text-element-2" />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-center">Some features may not work in this browser</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        For the smoothest experience, please use the latest Google Chrome on Laptop/Desktop.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center justify-around sm:justify-around gap-4">
                    {/* Playful Continue Button with overlapping elements */}
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        className={cn(
                            "relative group overflow-visible h-11 px-5 rounded-full",
                            "bg-cta-secondary hover:bg-gray-100 text-cta-secondary-text border border-cta-secondary"
                        )}
                    >
                        <span
                            className={cn(
                                "block origin-left transform transition-transform duration-300",
                                "group-hover:-rotate-12"
                            )}
                        >
                            Continue anyway
                        </span>
                        <span
                            className={cn(
                                "pointer-events-none absolute inset-0 flex items-center justify-end px-4",
                                "translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            )}
                        >
                            <span className="inline-flex items-right gap-2 text-gray-700">
                                <FaRegEye className="w-4 h-4 text-element-2 -mr-1 -rotate-12" />
                                <FaRegEye className="w-4 h-4 text-element-2 ml-1 rotate-12" />
                            </span>
                        </span>
                    </Button>

                    {/* <AlertDialogCancel
                        asChild
                        className="hidden"
                    >
                        <button />
                    </AlertDialogCancel> */}

                    <Button
                        type="button"
                        onClick={handleOpenInChrome}
                        className="h-11 px-5 rounded-full bg-cta-primary hover:bg-green-800 text-cta-primary-text"
                    >
                        Open in Chrome
                    </Button>
                </AlertDialogFooter>

                {showHelp && (
                    <div className="mt-4 space-y-3">
                        <div className="text-sm text-gray-700">
                            If Chrome didn’t open, please open Chrome manually and paste this link:
                        </div>
                        <div className="flex items-stretch gap-2">
                            <input
                                readOnly
                                value={currentUrl}
                                className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm bg-gray-50"
                                onFocus={(e) => e.currentTarget.select()}
                            />
                            <div className="relative">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        try { navigator.clipboard?.writeText(currentUrl); } catch { }
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1200);
                                    }}
                                >
                                    {copied ? (
                                        <span className="inline-flex items-center gap-1 text-green-700">
                                            <FaCheck className="w-4 h-4" /> Copied
                                        </span>
                                    ) : (
                                        "Copy"
                                    )}
                                </Button>
                                {copied && (
                                    <span className="absolute -top-7 right-1 text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 animate-bounce">
                                        Copied!
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-xs text-gray-600">
                            Then paste into Chrome’s address bar and press Enter.
                        </div>
                    </div>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}


