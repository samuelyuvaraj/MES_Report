import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NamedCount } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";
import "./dashboard.css";

const colors: Record<string, string> = {
    "On Time": "#0dbb85",
    "Completed Late": "#f5a623",
    Overdue: "#ef535d",
    "Due Later": "#94a3b8"
};

export function OnTimePerformanceChart({ data }: { data: NamedCount[] }) {
    const hasValues = data.some((item) => item.value > 0);

    return (
        <section className="dashboard-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>On-Time Performance</h2>
                    <p>Actual end date compared with due date</p>
                </div>
            </div>
            {!hasValues ? (
                <EmptyState title="No due-date data" description="Work orders in this period do not have enough due dates to chart on-time performance." />
            ) : (
                <ResponsiveContainer height={245} width="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis axisLine={false} dataKey="name" tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Bar animationDuration={750} dataKey="value" radius={[7, 7, 0, 0]}>
                            {data.map((item) => <Cell fill={colors[item.name] ?? "#2872ee"} key={item.name} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}
