import { MoreHorizontal } from "lucide-react";
import { formatDisplayDate } from "../../lib/dateRange";
import type { RecentWorkOrder } from "../../types/dashboard";
import { EmptyState } from "./EmptyState";
import "./table.css";

function statusClass(status: string | null): string {
    const value = (status ?? "").replace(/\s+/g, "").toLowerCase();
    if (value.includes("complete") || value.includes("closed")) {
        return "is-complete";
    }
    if (value.includes("progress") || value.includes("start") || value.includes("run")) {
        return "is-progress";
    }
    return "is-new";
}

export function RecentWorkOrdersTable({ rows }: { rows: RecentWorkOrder[] }) {
    return (
        <section className="dashboard-panel table-panel">
            <div className="dashboard-panel__head">
                <div>
                    <h2>Recent Work Orders</h2>
                    <p>Latest activity from vw_QA_WorkOrder</p>
                </div>
            </div>
            {rows.length === 0 ? (
                <EmptyState title="No work orders" description="No work orders were found for the selected date range." />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>WO Number</th>
                                <th>Material</th>
                                <th>Status</th>
                                <th>Planned Qty</th>
                                <th>Produced Qty</th>
                                <th>Due Date</th>
                                <th>Actual End Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={`${row.workOrderNumber}-${row.dueDate}-${index}`}>
                                    <td>{row.workOrderNumber || "—"}</td>
                                    <td>{row.material || "—"}</td>
                                    <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status || "Unknown"}</span></td>
                                    <td>{row.plannedQuantity?.toLocaleString() ?? "—"}</td>
                                    <td>{row.producedQuantity?.toLocaleString() ?? "—"}</td>
                                    <td>{formatDisplayDate(row.dueDate)}</td>
                                    <td>{formatDisplayDate(row.actualEndDate, true)}</td>
                                    <td>
                                        <button aria-label={`Actions for ${row.workOrderNumber}`} className="table-action" type="button">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
