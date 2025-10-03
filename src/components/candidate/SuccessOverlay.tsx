import { useRef, useLayoutEffect, useState } from "react";
import { CheckCircle, Mic } from "lucide-react";
import { Button } from "../ui/button";

function ConnectorLine({
    containerRef,
    topRef,
    bottomRef,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    topRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [path, setPath] = useState("");

    useLayoutEffect(() => {
        function updatePath() {
            if (containerRef.current && topRef.current && bottomRef.current) {
                const container = containerRef.current.getBoundingClientRect();
                const top = topRef.current.getBoundingClientRect();
                const bottom = bottomRef.current.getBoundingClientRect();

                const startX = top.left - container.left + top.width / 2;
                const startY = top.top - container.top + top.height / 2;
                const endX = bottom.left - container.left + bottom.width / 2;
                const endY = bottom.top - container.top + bottom.height / 2;

                const midY = (startY + endY) / 2;

                const upperCurveOffset = 120; // more right curve
                const lowerCurveOffset = 80;  // keep bottom softer

                const newPath = `M${startX},${startY} 
                           C ${startX + upperCurveOffset},${midY} 
                             ${endX - lowerCurveOffset},${midY} 
                             ${endX},${endY}`;

                setPath(newPath);
            }
        }

        updatePath();
        window.addEventListener("resize", updatePath);
        return () => window.removeEventListener("resize", updatePath);
    }, [containerRef, topRef, bottomRef]);

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
                d={path}
                stroke="#9CA3AF"
                strokeDasharray="6 6"
                fill="none"
                strokeWidth="2"
            />
        </svg>
    );
}


export default function SuccessOverlay({
    visible,
    onProceed,
}: {
    visible: boolean;
    onProceed: () => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main">
            <div
                ref={containerRef}
                className="relative rounded-xl p-10 text-center max-w-md shadow-xl"
            >
                {/* Top Icon */}
                <div
                    ref={topRef}
                    className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-r from-grad-1 to-grad-2 flex items-center justify-center"
                >
                    <CheckCircle className="text-white" />
                </div>
                <h3 className="font-semibold">Congratulations</h3>
                <p className="text-sm text-gray-600">Your profile is approved.</p>

                {/* Connector Line */}
                <ConnectorLine
                    containerRef={containerRef}
                    topRef={topRef}
                    bottomRef={bottomRef}
                />

                {/* Bottom Icon */}
                <div
                    ref={bottomRef}
                    className="mx-auto my-10 mt-10 w-12 h-12 rounded-full bg-gradient-to-r from-grad-1 to-grad-2 flex items-center justify-center"
                >
                    <Mic className="text-white" />
                </div>
                <h4 className="font-semibold">Final step</h4>
                <p className="text-sm text-gray-600">
                    Add your voice. 5 minutes to stand out and get call backs from
                    companies.
                </p>

                {/* Button */}
                <div className="mt-8">
                    <Button
                        onClick={onProceed}
                        variant="primary"
                        className="px-6 py-2 rounded-full bg-cta-primary text-cta-primary-text cursor-pointer"
                    >
                        Proceed
                    </Button>
                </div>
            </div>
        </div>
    );
}
