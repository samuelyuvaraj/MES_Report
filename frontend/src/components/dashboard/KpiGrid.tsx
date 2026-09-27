import { Activity, CheckCircle2, ClipboardList, PackageCheck } from "lucide-react";
import type { DashboardSummary } from "../../types/dashboard";
import { KpiCard } from "./KpiCard";

interface KpiGridProps {
    summary: DashboardSummary;
}

export function KpiGrid({ summary }: KpiGridProps) {
    const cards = [
        ["Total Work Orders", summary.totalWorkOrders, "All work orders", ClipboardList, "blue", summary.changes.totalWorkOrders, summary.sparklines.totalWorkOrders],
        ["New Work Orders", summary.newWorkOrders, "Orders marked as New", PackageCheck, "blue", summary.changes.newWorkOrders, summary.sparklines.newWorkOrders],
        ["In Progress", summary.inProgressWorkOrders, "Started, not completed", Activity, "amber", summary.changes.inProgressWorkOrders, summary.sparklines.inProgressWorkOrders],
        ["Completed by End Date", summary.ordersWithActualEndDate, "Orders with actual end", CheckCircle2, "green", summary.changes.ordersWithActualEndDate, summary.sparklines.ordersWithActualEndDate]
    ] as const;

    return (
        <div className="dashboard-kpi-grid">
            {cards.map(([title, value, description, Icon, accent, change, sparkline], index) => (
                <KpiCard
                    accent={accent}
                    change={change}
                    description={description}
                    icon={<Icon size={20} />}
                    index={index}
                    key={title}
                    sparkline={[...sparkline]}
                    title={title}
                    value={value}
                />
            ))}
        </div>
    );
}
