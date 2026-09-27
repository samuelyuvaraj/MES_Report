import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "../common/AnimatedNumber";
import "./KpiCard.css";

interface KpiCardProps {
    title: string;
    value: number;
    description?: string;
    icon?: ReactNode;
    accent?: "blue" | "amber" | "green" | "orange" | "red";
    change?: number;
    sparkline?: number[];
    index?: number;
}

function Sparkline({ points }: { points: number[] }) {
    if (points.length < 2) {
        return null;
    }

    const width = 92;
    const height = 32;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const span = max - min || 1;
    const path = points.map((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - ((point - min) / span) * (height - 4) - 2;
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    return (
        <svg aria-hidden className="kpi-card__spark" viewBox={`0 0 ${width} ${height}`}>
            <path d={path} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
    );
}

export function KpiCard({
    title,
    value,
    description,
    icon,
    accent = "blue",
    change = 0,
    sparkline = [],
    index = 0
}: KpiCardProps) {
    const isPositive = change >= 0;

    return (
        <article className={`kpi-card kpi-card--${accent}`} style={{ animationDelay: `${index * 55}ms` }}>
            <div className="kpi-card__top">
                <span className="kpi-card__title">{title}</span>
                {icon && <span className="kpi-card__icon">{icon}</span>}
            </div>
            <div className="kpi-card__value-row">
                <strong className="kpi-card__value"><AnimatedNumber value={value} /></strong>
                <Sparkline points={sparkline} />
            </div>
            <div className="kpi-card__bottom">
                {description && <span className="kpi-card__description">{description}</span>}
                <span className={`kpi-card__trend ${isPositive ? "" : "is-down"}`}>
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {isPositive ? "+" : ""}{change.toFixed(0)}%
                </span>
            </div>
        </article>
    );
}
