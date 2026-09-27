export interface NamedCount {
    name: string;
    value: number;
}

export interface DashboardSummary {
    totalWorkOrders: number;
    newWorkOrders: number;
    inProgressWorkOrders: number;
    ordersWithActualEndDate: number;
    totalProducedQuantity: number;
    totalReworkedQuantity: number;
    totalScrappedQuantity: number;
    plannedQuantity: number;
    pendingQuantity: number;
    productionAchievement: number;
    onTimeCompletionRate: number;
    onTimeCompleted: number;
    completedWithDueDate: number;
    goodQuantity: number;
    qualityTotal: number;
    productionYield: number;
    reworkRate: number;
    scrapRate: number;
    changes: {
        totalWorkOrders: number;
        newWorkOrders: number;
        inProgressWorkOrders: number;
        ordersWithActualEndDate: number;
        productionAchievement: number;
        pendingQuantity: number;
        onTimeCompletionRate: number;
        productionYield: number;
        reworkRate: number;
        scrapRate: number;
    };
    sparklines: {
        totalWorkOrders: number[];
        newWorkOrders: number[];
        inProgressWorkOrders: number[];
        ordersWithActualEndDate: number[];
    };
    onTimePerformance: NamedCount[];
    aging: NamedCount[];
    topMaterialsByRework: NamedCount[];
    topProcessesByScrap: NamedCount[];
    recentWorkOrders: RecentWorkOrder[];
}

export interface RecentWorkOrder {
    workOrderNumber: string;
    material: string | null;
    status: string | null;
    plannedQuantity: number | null;
    producedQuantity: number | null;
    dueDate: string | null;
    actualEndDate: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ProductionTrendPoint {
    label: string;
    produced: number;
    reworked: number;
    scrapped: number;
}

export interface DateRangeValue {
    from: Date;
    to: Date;
}

export type DatePreset = "All" | "Today" | "This Week" | "This Month" | "Custom";
