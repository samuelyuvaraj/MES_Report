import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NamedCount } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";
import "./dashboard.css";

export function TopBarsChart({
    title,
    description,
    data,
    color,
    emptyTitle
}: {
    title: string;
    description: string;
    data: NamedCount[];
    color: string;
    emptyTitle: string;
}) {
    const chartData = data.filter((item) => item.value > 0);

    return (
        <section className="dashboard-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
            {chartData.length === 0 ? (
                <EmptyState title={emptyTitle} description="No ranked records are available for the selected period." />
            ) : (
                <ResponsiveContainer height={230} width="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                        <XAxis hide type="number" />
                        <YAxis axisLine={false} dataKey="name" tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} type="category" width={92} />
                        <Tooltip />
                        <Bar animationDuration={750} dataKey="value" fill={color} radius={[0, 7, 7, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}
