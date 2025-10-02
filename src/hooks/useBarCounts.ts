import { useEffect, useState } from "react";

export default function useResponsiveBarCount(): number {
    // Dynamically determine bar count based on screen width
    const [barCount, setBarCount] = useState<number>(getBarCount(window.innerWidth));

    useEffect(() => {
        function handleResize() {
            setBarCount(getBarCount(window.innerWidth));
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function getBarCount(width: number): number {
        if (width < 400) return 16;
        if (width < 640) return 24;
        if (width < 900) return 32;
        return 45;
    }

    return barCount;
}