import type { DashboardSummary } from "../../types/dashboard";
import "./dashboard.css";
import "./table.css";

export function ProductionQualityChart({ summary }: { summary: DashboardSummary }) {
    const total = summary.qualityTotal || 1;
    const segments = [
        { name: "Good Production", value: summary.goodQuantity, color: "#0dbb85", pct: summary.productionYield },
        { name: "Reworked", value: summary.totalReworkedQuantity, color: "#f47d28", pct: summary.reworkRate },
        { name: "Scrapped", value: summary.totalScrappedQuantity, color: "#ef535d", pct: summary.scrapRate }
    ];

    return (
        <section className="dashboard-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>Production Quality</h2>
                    <p>Good vs reworked vs scrapped quantity</p>
                </div>
            </div>
            <div className="quality-bar" aria-label="Production quality split">
                {segments.map((segment) => (
                    <span
                        key={segment.name}
                        style={{ width: `${Math.max((segment.value / total) * 100, segment.value > 0 ? 6 : 0)}%`, background: segment.color }}
                        title={`${segment.name}: ${segment.value}`}
                    />
                ))}
            </div>
            <div className="status-legend">
                {segments.map((segment) => (
                    <div key={segment.name}>
                        <span style={{ backgroundColor: segment.color }} />
                        <b>{segment.name}</b>
                        <em>{segment.value.toLocaleString()} ({segment.pct.toFixed(1)}%)</em>
                    </div>
                ))}
            </div>
        </section>
    );
}
