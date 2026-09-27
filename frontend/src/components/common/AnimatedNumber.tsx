import { useEffect, useState } from "react";

interface AnimatedNumberProps {
    value: number;
    suffix?: string;
    decimals?: number;
}

export function AnimatedNumber({ value, suffix = "", decimals = 0 }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const start = performance.now();
        const duration = 650;
        let frame = 0;
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const next = value * (1 - Math.pow(1 - progress, 3));
            setDisplay(decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [decimals, value]);

    return <>{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}
