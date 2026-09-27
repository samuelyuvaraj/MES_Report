import { useEffect, useMemo, useState } from "react";
import { DateRangeFilter } from "../components/common/DateRangeFilter";
import { KpiGrid } from "../components/dashboard/KpiGrid";
import { OnTimePerformanceChart } from "../components/dashboard/OnTimePerformanceChart";
import { PerformancePanels } from "../components/dashboard/PerformancePanels";
import { ProductionQualityChart } from "../components/dashboard/ProductionQualityChart";
import { ProductionTrendChart } from "../components/dashboard/ProductionTrendChart";
import { RecentWorkOrdersTable } from "../components/dashboard/RecentWorkOrdersTable";
import { TopBarsChart } from "../components/dashboard/TopBarsChart";
import { WorkOrderAgingChart } from "../components/dashboard/WorkOrderAgingChart";
import { WorkOrderStatusChart } from "../components/dashboard/WorkOrderStatusChart";
import { EmptyState } from "../components/dashboard/EmptyState";
import { SectionHeader } from "../components/dashboard/SectionHeader";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { formatRangeLabel, resolveDateRange } from "../lib/dateRange";
import { getDashboardSummary } from "../services/dashboard.service";
import type { DashboardSummary, DatePreset } from "../types/dashboard";
import "./DashboardPage.css";
import "../components/dashboard/dashboard.css";

export function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [datePreset, setDatePreset] = useState<DatePreset>("All");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const range = useMemo(() => resolveDateRange(datePreset, customFrom, customTo), [customFrom, customTo, datePreset]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);
                const data = await getDashboardSummary(range);
                setSummary(data);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        void loadDashboard();
    }, [range]);

    return (
        <section className="dashboard-page">
            <div className="dashboard-page__intro">
                <SectionHeader
                    description="Monitor work orders, production progress, rework, and scrap in real time."
                    eyebrow="Project- Astra"
                    title="Production Dashboard"
                />
                <DateRangeFilter
                    customFrom={customFrom}
                    customTo={customTo}
                    label={formatRangeLabel(range)}
                    onChange={setDatePreset}
                    onCustomChange={(from, to) => {
                        setCustomFrom(from);
                        setCustomTo(to);
                        setDatePreset("Custom");
                    }}
                    value={datePreset}
                />
            </div>

            {loading ? (
                <LoadingState label="Loading dashboard data..." />
            ) : error || !summary ? (
                error ? <ErrorState message={error} /> : <EmptyState title="No dashboard data" description="No quality data is currently available." />
            ) : (
                <>
                    <KpiGrid summary={summary} />
                    <PerformancePanels summary={summary} />
                    <div className="dashboard-charts">
                        <ProductionTrendChart range={range} />
                        <WorkOrderStatusChart summary={summary} />
                        <OnTimePerformanceChart data={summary.onTimePerformance} />
                    </div>
                    <div className="dashboard-charts dashboard-charts--four">
                        <ProductionQualityChart summary={summary} />
                        <WorkOrderAgingChart data={summary.aging} />
                        <TopBarsChart
                            color="#f47d28"
                            data={summary.topMaterialsByRework}
                            description="Highest reworked quantity by final material"
                            emptyTitle="No rework by material"
                            title="Top 5 Materials by Rework"
                        />
                        <TopBarsChart
                            color="#ef535d"
                            data={summary.topProcessesByScrap}
                            description="Highest scrapped quantity by process"
                            emptyTitle="No scrap by process"
                            title="Top 5 Processes by Scrap"
                        />
                    </div>
                    <RecentWorkOrdersTable rows={summary.recentWorkOrders} />
                </>
            )}
        </section>
    );
}
