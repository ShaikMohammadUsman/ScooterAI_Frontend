import useResponsiveBarCount from "@/hooks/useBarCounts";
import { useMemo } from "react";

interface WavyAnimationProps {
    showAnimation?: boolean;
}

export default function WavyAnimation({ showAnimation = true }: WavyAnimationProps) {
    const barCount = useResponsiveBarCount();
    const bars = useMemo(() => Array.from({ length: barCount }), [barCount]);
    return (
        <div className="h-10 px-3 rounded-full flex items-end justify-center gap-[3px]">
            {bars.map((_, i) => (
                <span
                    key={i}
                    className="w-[3px] rounded-sm"
                    style={{
                        height: `${8 + ((i * 37) % 24)}px`,
                        background: `linear-gradient(180deg, var(--color-grad-1), var(--color-grad-2))`,
                        animation: `${showAnimation ? 'sbars 1.2s ease-in-out' : 'none'} ${i * 0.04}s infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes sbars {
                    0%, 100% { transform: scaleY(0.4); opacity: 0.85; }
                    50% { transform: scaleY(1.35); opacity: 1; }
                }
            `}</style>
        </div>
    );
};