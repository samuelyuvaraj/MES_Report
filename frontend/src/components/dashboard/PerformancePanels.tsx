import { TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "../common/AnimatedNumber";
import type { DashboardSummary } from "../../types/dashboard";
import "./performance.css";

function Change({ value }: { value: number }) {
    const up = value >= 0;
    return (
        <span className={`metric-change ${up ? "is-up" : "is-down"}`}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {up ? "+" : ""}{value.toFixed(1)}%
        </span>
    );
}

export function PerformancePanels({ summary }: { summary: DashboardSummary }) {
    return (
        <div className="perf-grid">
            <section className="dashboard-panel">
                <div className="dashboard-panel__head">
                    <div>
                        <h2>Production Performance</h2>
                        <p>Achievement, remaining quantity, and due-date adherence</p>
                    </div>
                </div>
                <div className="perf-cards">
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>Production Achievement</span>
                            <Change value={summary.changes.productionAchievement} />
                        </div>
                        <div className="metric-card__body">
                            <div
                                className="gauge"
                                style={{ background: `conic-gradient(var(--primary) ${summary.productionAchievement}%, #e6edf8 0)` }}
                            >
                                <strong><AnimatedNumber decimals={0} suffix="%" value={summary.productionAchievement} /></strong>
                            </div>
                            <div>
                                <p>Produced vs Planned</p>
                                <em>{summary.totalProducedQuantity.toLocaleString()} / {summary.plannedQuantity.toLocaleString()} pcs</em>
                            </div>
                        </div>
                    </article>
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>Pending Quantity</span>
                            <Change value={summary.changes.pendingQuantity} />
                        </div>
                        <strong className="metric-card__value"><AnimatedNumber suffix=" pcs" value={summary.pendingQuantity} /></strong>
                        <p>Remaining to produce</p>
                        <em>{summary.pendingQuantity.toLocaleString()} / {summary.plannedQuantity.toLocaleString()} pcs</em>
                    </article>
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>On-Time Completion</span>
                            <Change value={summary.changes.onTimeCompletionRate} />
                        </div>
                        <strong className="metric-card__value"><AnimatedNumber decimals={0} suffix="%" value={summary.onTimeCompletionRate} /></strong>
                        <p>Completed on or before due date</p>
                        <em>{summary.onTimeCompleted.toLocaleString()} / {summary.completedWithDueDate.toLocaleString()} WOs</em>
                    </article>
                </div>
            </section>

            <section className="dashboard-panel">
                <div className="dashboard-panel__head">
                    <div>
                        <h2>Quality Performance</h2>
                        <p>Yield, rework, and scrap ratios from recorded quantities</p>
                    </div>
                </div>
                <div className="perf-cards">
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>Production Yield</span>
                            <Change value={summary.changes.productionYield} />
                        </div>
                        <strong className="metric-card__value is-success"><AnimatedNumber decimals={1} suffix="%" value={summary.productionYield} /></strong>
                        <p>Good production ratio</p>
                        <em>{summary.goodQuantity.toLocaleString()} / {summary.qualityTotal.toLocaleString()} pcs</em>
                    </article>
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>Rework Rate</span>
                            <Change value={summary.changes.reworkRate} />
                        </div>
                        <strong className="metric-card__value is-warning"><AnimatedNumber decimals={1} suffix="%" value={summary.reworkRate} /></strong>
                        <p>Reworked quantity ratio</p>
                        <em>{summary.totalReworkedQuantity.toLocaleString()} / {summary.qualityTotal.toLocaleString()} pcs</em>
                    </article>
                    <article className="metric-card">
                        <div className="metric-card__head">
                            <span>Scrap Rate</span>
                            <Change value={summary.changes.scrapRate} />
                        </div>
                        <strong className="metric-card__value is-danger"><AnimatedNumber decimals={1} suffix="%" value={summary.scrapRate} /></strong>
                        <p>Scrapped quantity ratio</p>
                        <em>{summary.totalScrappedQuantity.toLocaleString()} / {summary.qualityTotal.toLocaleString()} pcs</em>
                    </article>
                </div>
            </section>
        </div>
    );
}
