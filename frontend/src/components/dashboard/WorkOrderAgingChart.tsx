import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NamedCount } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";
import "./dashboard.css";

export function WorkOrderAgingChart({ data }: { data: NamedCount[] }) {
    const hasValues = data.some((item) => item.value > 0);

    return (
        <section className="dashboard-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>Work Order Aging (In Progress)</h2>
                    <p>Age of open orders from start or schedule date</p>
                </div>
            </div>
            {!hasValues ? (
                <EmptyState title="No in-progress aging" description="There are no open work orders in this period to age." />
            ) : (
                <ResponsiveContainer height={230} width="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis axisLine={false} dataKey="name" tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tick={{ fill: "#5d7093", fontSize: 11 }} tickLine={false} />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Bar animationDuration={750} dataKey="value" fill="#2872ee" radius={[7, 7, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </section>
    );
}
