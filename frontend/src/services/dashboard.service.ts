import { api } from "../lib/api";
import { toQueryDate } from "../lib/dateRange";
import type {
    ApiResponse,
    DashboardSummary,
    DateRangeValue,
    ProductionTrendPoint
} from "../types/dashboard";

function rangeParams(range: DateRangeValue | null) {
    if (!range) {
        return {};
    }

    return {
        from: toQueryDate(range.from),
        to: toQueryDate(range.to)
    };
}

export async function getDashboardSummary(range: DateRangeValue | null): Promise<DashboardSummary> {
    const response = await api.get<ApiResponse<DashboardSummary>>("/dashboard/summary", {
        params: rangeParams(range)
    });

    return response.data.data;
}

export async function getProductionTrend(
    period: "daily" | "weekly" | "monthly",
    range: DateRangeValue | null
): Promise<ProductionTrendPoint[]> {
    const response = await api.get<ApiResponse<ProductionTrendPoint[]>>("/dashboard/trends", {
        params: { period, ...rangeParams(range) }
    });

    return response.data.data;
}
