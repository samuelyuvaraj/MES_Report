import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "../../types/dashboard";
import "./dashboard.css";

const colors = ["#2872ee", "#f5a623", "#0dbb85"];

export function WorkOrderStatusChart({ summary }: { summary: DashboardSummary }) {
    const data = [
        { name: "New", value: summary.newWorkOrders },
        { name: "In Progress", value: summary.inProgressWorkOrders },
        { name: "Completed", value: summary.ordersWithActualEndDate }
    ];
    const total = Math.max(summary.totalWorkOrders, 1);

    return (
        <section className="dashboard-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>Work Order Status</h2>
                    <p>Distribution of work orders by status</p>
                </div>
            </div>
            <div className="status-chart">
                <ResponsiveContainer height={210} width="100%">
                    <PieChart>
                        <Pie animationDuration={750} data={data} dataKey="value" innerRadius={55} nameKey="name" outerRadius={78} paddingAngle={3}>
                            {data.map((item, index) => <Cell fill={colors[index]} key={item.name} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="status-chart__total">
                    <strong>{summary.totalWorkOrders}</strong>
                    <span>Total</span>
                </div>
            </div>
            <div className="status-legend">
                {data.map((item, index) => (
                    <div key={item.name}>
                        <span style={{ backgroundColor: colors[index] }} />
                        <b>{item.name}</b>
                        <em>{item.value} ({Math.round((item.value / total) * 100)}%)</em>
                    </div>
                ))}
            </div>
        </section>
    );
}
