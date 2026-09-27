import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState } from "../common/ErrorState";
import { LoadingState } from "../common/LoadingState";
import { getProductionTrend } from "../../services/dashboard.service";
import type { DateRangeValue, ProductionTrendPoint } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";
import "./dashboard.css";

type Period = "daily" | "weekly" | "monthly";

export function ProductionTrendChart({ range }: { range: DateRangeValue | null }) {
    const [period, setPeriod] = useState<Period>("daily");
    const [data, setData] = useState<ProductionTrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getProductionTrend(period, range)
            .then((result) => {
                if (active) {
                    setData(result);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Unable to load historical production data.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [period, range?.from, range?.to]);

    function changePeriod(nextPeriod: Period) {
        if (nextPeriod === period) {
            return;
        }
        setPeriod(nextPeriod);
    }

    return (
        <section className="dashboard-panel dashboard-panel--wide">
            <div className="dashboard-panel__head">
                <div>
                    <h2>Production Trend</h2>
                    <p>Produced vs reworked vs scrapped quantity</p>
                </div>
                <div className="chart-tabs">
                    {(["daily", "weekly", "monthly"] as Period[]).map((item) => (
                        <button className={period === item ? "is-active" : ""} key={item} onClick={() => changePeriod(item)} type="button">
                            {item[0].toUpperCase() + item.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <LoadingState label="Loading production trend..." />
            ) : error ? (
                <ErrorState message={error} />
            ) : data.length === 0 ? (
                <EmptyState title="Historical trend unavailable" description="There are not enough historical production records to calculate a reliable trend yet." />
            ) : (
                <ResponsiveContainer height={250} width="100%">
                    <LineChart data={data}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis axisLine={false} dataKey="label" tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Line animationDuration={750} dataKey="produced" dot={{ r: 3 }} name="Produced" stroke="#2872ee" strokeWidth={2.5} type="monotone" />
                        <Line animationDuration={750} dataKey="reworked" dot={{ r: 3 }} name="Reworked" stroke="#f47d28" strokeWidth={2.5} type="monotone" />
                        <Line animationDuration={750} dataKey="scrapped" dot={{ r: 3 }} name="Scrapped" stroke="#ef535d" strokeWidth={2.5} type="monotone" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}
