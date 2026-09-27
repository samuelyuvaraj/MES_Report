import sql from "mssql";
import { getDb } from "../config/database.js";
import { previousRange, type DateRange } from "../utils/date-range.js";

const activityDate = "COALESCE(SchedulingDate, ActualStartDate, DueDate, RowInserted)";
const inRange = `${activityDate} >= @fromDate AND ${activityDate} < @toDate`;
const statusNorm = "UPPER(REPLACE(LTRIM(RTRIM(ISNULL(WOStatus, ''))), ' ', ''))";
const qty = (column: string) => `ISNULL(TRY_CONVERT(decimal(18, 2), ${column}), 0)`;

export interface NamedCount {
    name: string;
    value: number;
}

export interface ProductionTrendPoint {
    label: string;
    produced: number;
    reworked: number;
    scrapped: number;
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

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 1): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function percent(part: number, whole: number): number {
    if (whole <= 0) {
        return 0;
    }

    return round((part / whole) * 100);
}

function changePct(current: number, previous: number): number {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return round(((current - previous) / previous) * 100);
}

function withRange(db: sql.ConnectionPool, range: DateRange | null): sql.Request {
    const request = db.request();
    if (range) {
        request.input("fromDate", sql.DateTime2, range.from);
        request.input("toDate", sql.DateTime2, range.to);
    }
    return request;
}

function scopedWhere(range: DateRange | null, extra = ""): string {
    const clauses = [range ? inRange : "", extra].filter(Boolean);
    return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

function toIso(value: unknown): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

interface KpiRow {
    totalWorkOrders: unknown;
    newWorkOrders: unknown;
    inProgressWorkOrders: unknown;
    ordersWithActualEndDate: unknown;
    produced: unknown;
    reworked: unknown;
    scrapped: unknown;
    planned: unknown;
    target: unknown;
    onTimeCompleted: unknown;
    completedWithDueDate: unknown;
}

function readKpis(row: KpiRow | undefined) {
    const produced = toNumber(row?.produced);
    const reworked = toNumber(row?.reworked);
    const scrapped = toNumber(row?.scrapped);
    const planned = toNumber(row?.planned);
    const target = toNumber(row?.target);
    const qualityTotal = produced + reworked + scrapped;
    const goodQuantity = produced;
    const pendingQuantity = Math.max(target - produced, 0);
    const completedWithDueDate = toNumber(row?.completedWithDueDate);
    const onTimeCompleted = toNumber(row?.onTimeCompleted);

    return {
        totalWorkOrders: toNumber(row?.totalWorkOrders),
        newWorkOrders: toNumber(row?.newWorkOrders),
        inProgressWorkOrders: toNumber(row?.inProgressWorkOrders),
        ordersWithActualEndDate: toNumber(row?.ordersWithActualEndDate),
        produced,
        reworked,
        scrapped,
        planned,
        pendingQuantity,
        productionAchievement: percent(produced, planned),
        onTimeCompleted,
        completedWithDueDate,
        onTimeCompletionRate: percent(onTimeCompleted, completedWithDueDate),
        goodQuantity,
        qualityTotal,
        productionYield: percent(goodQuantity, qualityTotal),
        reworkRate: percent(reworked, qualityTotal),
        scrapRate: percent(scrapped, qualityTotal)
    };
}

const kpiSelect = `
    SELECT
      COUNT_BIG(*) AS totalWorkOrders,
      SUM(CASE WHEN ${statusNorm} = 'NEW' THEN 1 ELSE 0 END) AS newWorkOrders,
      SUM(
        CASE
          WHEN ${statusNorm} IN ('INPROGRESS', 'STARTED', 'RUNNING', 'OPEN') THEN 1
          WHEN ActualStartDate IS NOT NULL
           AND ActualEndDate IS NULL
           AND ${statusNorm} NOT IN ('NEW', 'COMPLETED', 'COMPLETE', 'CLOSED')
          THEN 1
          ELSE 0
        END
      ) AS inProgressWorkOrders,
      SUM(CASE WHEN ActualEndDate IS NOT NULL THEN 1 ELSE 0 END) AS ordersWithActualEndDate,
      SUM(${qty("ProducedQuantity")}) AS produced,
      SUM(${qty("ReworkedQuantity")}) AS reworked,
      SUM(${qty("ScrappedQuantity")}) AS scrapped,
      SUM(CASE
            WHEN ${qty("PlannedTargetQuantity")} > 0 THEN ${qty("PlannedTargetQuantity")}
            WHEN ${qty("TargetQuantity")} > 0 THEN ${qty("TargetQuantity")}
            WHEN ${qty("ActualTargetQuantity")} > 0 THEN ${qty("ActualTargetQuantity")}
            ELSE 1
          END) AS planned,
      SUM(CASE
            WHEN ${qty("TargetQuantity")} > 0 THEN ${qty("TargetQuantity")}
            WHEN ${qty("PlannedTargetQuantity")} > 0 THEN ${qty("PlannedTargetQuantity")}
            WHEN ${qty("ActualTargetQuantity")} > 0 THEN ${qty("ActualTargetQuantity")}
            ELSE 1
          END) AS target,
      SUM(
        CASE
          WHEN ActualEndDate IS NOT NULL
           AND DueDate IS NOT NULL
           AND CAST(ActualEndDate AS date) <= CAST(DueDate AS date)
          THEN 1 ELSE 0
        END
      ) AS onTimeCompleted,
      SUM(
        CASE
          WHEN ActualEndDate IS NOT NULL AND DueDate IS NOT NULL THEN 1 ELSE 0
        END
      ) AS completedWithDueDate
    FROM dbo.vw_QA_WorkOrder
`;

function kpiQuery(range: DateRange | null): string {
    return `${kpiSelect} ${scopedWhere(range)}`;
}

export async function getDashboardSummary(range: DateRange | null): Promise<DashboardSummary> {
    const db = await getDb();
    const prior = range ? previousRange(range) : null;

    const [currentResult, previousResult, sparkResult, onTimeResult, agingResult, materialResult, processResult, recentResult] = await Promise.all([
        withRange(db, range).query(kpiQuery(range)),
        prior ? withRange(db, prior).query(kpiQuery(prior)) : Promise.resolve({ recordset: [undefined] }),
        withRange(db, range).query(`
            SELECT CAST(${activityDate} AS date) AS periodDate,
                   COUNT_BIG(*) AS totalWorkOrders,
                   SUM(CASE WHEN ${statusNorm} = 'NEW' THEN 1 ELSE 0 END) AS newWorkOrders,
                   SUM(
                     CASE
                       WHEN ${statusNorm} IN ('INPROGRESS', 'STARTED', 'RUNNING', 'OPEN') THEN 1
                       WHEN ActualStartDate IS NOT NULL AND ActualEndDate IS NULL THEN 1
                       ELSE 0
                     END
                   ) AS inProgressWorkOrders,
                   SUM(CASE WHEN ActualEndDate IS NOT NULL THEN 1 ELSE 0 END) AS ordersWithActualEndDate
            FROM dbo.vw_QA_WorkOrder
            ${scopedWhere(range, `${activityDate} IS NOT NULL`)}
            GROUP BY CAST(${activityDate} AS date)
            ORDER BY periodDate;
        `),
        withRange(db, range).query(`
            SELECT
              SUM(CASE WHEN ActualEndDate IS NOT NULL AND DueDate IS NOT NULL AND CAST(ActualEndDate AS date) <= CAST(DueDate AS date) THEN 1 ELSE 0 END) AS onTime,
              SUM(CASE WHEN ActualEndDate IS NOT NULL AND DueDate IS NOT NULL AND CAST(ActualEndDate AS date) > CAST(DueDate AS date) THEN 1 ELSE 0 END) AS completedLate,
              SUM(CASE WHEN ActualEndDate IS NULL AND DueDate IS NOT NULL AND CAST(DueDate AS date) < CAST(SYSUTCDATETIME() AS date) THEN 1 ELSE 0 END) AS overdue,
              SUM(CASE WHEN ActualEndDate IS NULL AND (DueDate IS NULL OR CAST(DueDate AS date) >= CAST(SYSUTCDATETIME() AS date)) THEN 1 ELSE 0 END) AS dueLater
            FROM dbo.vw_QA_WorkOrder
            ${scopedWhere(range)};
        `),
        withRange(db, range).query(`
            SELECT bucket, COUNT_BIG(*) AS value
            FROM (
              SELECT
                CASE
                  WHEN DATEDIFF(DAY, COALESCE(ActualStartDate, SchedulingDate, ${activityDate}), SYSUTCDATETIME()) <= 2 THEN '0-2 Days'
                  WHEN DATEDIFF(DAY, COALESCE(ActualStartDate, SchedulingDate, ${activityDate}), SYSUTCDATETIME()) <= 5 THEN '3-5 Days'
                  WHEN DATEDIFF(DAY, COALESCE(ActualStartDate, SchedulingDate, ${activityDate}), SYSUTCDATETIME()) <= 10 THEN '6-10 Days'
                  ELSE '10+ Days'
                END AS bucket
              FROM dbo.vw_QA_WorkOrder
              ${scopedWhere(range, `ActualEndDate IS NULL AND (
                  ${statusNorm} IN ('INPROGRESS', 'STARTED', 'RUNNING', 'OPEN')
                  OR ActualStartDate IS NOT NULL
                )`)}
            ) aging
            GROUP BY bucket;
        `),
        withRange(db, range).query(`
            SELECT TOP 5
              COALESCE(NULLIF(LTRIM(RTRIM(FinalMaterial)), ''), NULLIF(LTRIM(RTRIM(MaterialLotNId)), ''), 'Unknown') AS name,
              SUM(${qty("ReworkedQuantity")}) AS value
            FROM dbo.vw_QA_WorkOrder
            ${scopedWhere(range)}
            GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(FinalMaterial)), ''), NULLIF(LTRIM(RTRIM(MaterialLotNId)), ''), 'Unknown')
            ORDER BY value DESC;
        `),
        withRange(db, range).query(`
            SELECT TOP 5
              COALESCE(NULLIF(LTRIM(RTRIM(Process)), ''), NULLIF(LTRIM(RTRIM(ProcessNId)), ''), 'Unknown') AS name,
              SUM(${qty("ScrappedQuantity")}) AS value
            FROM dbo.vw_QA_WorkOrder
            ${scopedWhere(range)}
            GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(Process)), ''), NULLIF(LTRIM(RTRIM(ProcessNId)), ''), 'Unknown')
            ORDER BY value DESC;
        `),
        withRange(db, range).query(`
            SELECT TOP 10
              WorkOrderNumber,
              COALESCE(NULLIF(LTRIM(RTRIM(FinalMaterial)), ''), MaterialLotNId) AS material,
              WOStatus AS status,
              ${qty("PlannedTargetQuantity")} AS plannedQuantity,
              ${qty("ProducedQuantity")} AS producedQuantity,
              DueDate,
              ActualEndDate
            FROM dbo.vw_QA_WorkOrder
            ${scopedWhere(range)}
            ORDER BY COALESCE(ActualEndDate, ActualStartDate, SchedulingDate, RowUpdated, RowInserted) DESC;
        `)
    ]);

    const current = readKpis(currentResult.recordset[0]);
    const previous = readKpis(previousResult.recordset[0]);
    const onTime = onTimeResult.recordset[0] ?? {};
    const agingOrder = ["0-2 Days", "3-5 Days", "6-10 Days", "10+ Days"];
    const agingMap = new Map(agingResult.recordset.map((row) => [String(row.bucket), toNumber(row.value)]));

    return {
        totalWorkOrders: current.totalWorkOrders,
        newWorkOrders: current.newWorkOrders,
        inProgressWorkOrders: current.inProgressWorkOrders,
        ordersWithActualEndDate: current.ordersWithActualEndDate,
        totalProducedQuantity: current.produced,
        totalReworkedQuantity: current.reworked,
        totalScrappedQuantity: current.scrapped,
        plannedQuantity: current.planned,
        pendingQuantity: current.pendingQuantity,
        productionAchievement: current.productionAchievement,
        onTimeCompletionRate: current.onTimeCompletionRate,
        onTimeCompleted: current.onTimeCompleted,
        completedWithDueDate: current.completedWithDueDate,
        goodQuantity: current.goodQuantity,
        qualityTotal: current.qualityTotal,
        productionYield: current.productionYield,
        reworkRate: current.reworkRate,
        scrapRate: current.scrapRate,
        changes: {
            totalWorkOrders: changePct(current.totalWorkOrders, previous.totalWorkOrders),
            newWorkOrders: changePct(current.newWorkOrders, previous.newWorkOrders),
            inProgressWorkOrders: changePct(current.inProgressWorkOrders, previous.inProgressWorkOrders),
            ordersWithActualEndDate: changePct(current.ordersWithActualEndDate, previous.ordersWithActualEndDate),
            productionAchievement: round(current.productionAchievement - previous.productionAchievement),
            pendingQuantity: changePct(current.pendingQuantity, previous.pendingQuantity),
            onTimeCompletionRate: round(current.onTimeCompletionRate - previous.onTimeCompletionRate),
            productionYield: round(current.productionYield - previous.productionYield),
            reworkRate: round(current.reworkRate - previous.reworkRate),
            scrapRate: round(current.scrapRate - previous.scrapRate)
        },
        sparklines: {
            totalWorkOrders: sparkResult.recordset.map((row) => toNumber(row.totalWorkOrders)),
            newWorkOrders: sparkResult.recordset.map((row) => toNumber(row.newWorkOrders)),
            inProgressWorkOrders: sparkResult.recordset.map((row) => toNumber(row.inProgressWorkOrders)),
            ordersWithActualEndDate: sparkResult.recordset.map((row) => toNumber(row.ordersWithActualEndDate))
        },
        onTimePerformance: [
            { name: "On Time", value: toNumber(onTime.onTime) },
            { name: "Completed Late", value: toNumber(onTime.completedLate) },
            { name: "Overdue", value: toNumber(onTime.overdue) },
            { name: "Due Later", value: toNumber(onTime.dueLater) }
        ],
        aging: agingOrder.map((name) => ({ name, value: agingMap.get(name) ?? 0 })),
        topMaterialsByRework: materialResult.recordset.map((row) => ({
            name: String(row.name ?? "Unknown"),
            value: toNumber(row.value)
        })),
        topProcessesByScrap: processResult.recordset.map((row) => ({
            name: String(row.name ?? "Unknown"),
            value: toNumber(row.value)
        })),
        recentWorkOrders: recentResult.recordset.map((row) => ({
            workOrderNumber: String(row.WorkOrderNumber ?? ""),
            material: row.material ? String(row.material) : null,
            status: row.status ? String(row.status) : null,
            plannedQuantity: row.plannedQuantity === null || row.plannedQuantity === undefined ? null : toNumber(row.plannedQuantity),
            producedQuantity: row.producedQuantity === null || row.producedQuantity === undefined ? null : toNumber(row.producedQuantity),
            dueDate: toIso(row.DueDate),
            actualEndDate: toIso(row.ActualEndDate)
        }))
    };
}

export async function getProductionTrend(
    period: "daily" | "weekly" | "monthly",
    range: DateRange | null
): Promise<ProductionTrendPoint[]> {
    const db = await getDb();
    const groupExpression = period === "monthly"
        ? "DATEFROMPARTS(YEAR(COALESCE(ActualEndDate, SchedulingDate, ActualStartDate)), MONTH(COALESCE(ActualEndDate, SchedulingDate, ActualStartDate)), 1)"
        : period === "weekly"
            ? "DATEADD(WEEK, DATEDIFF(WEEK, 0, COALESCE(ActualEndDate, SchedulingDate, ActualStartDate)), 0)"
            : "CAST(COALESCE(ActualEndDate, SchedulingDate, ActualStartDate) AS date)";

    const result = await withRange(db, range).query(`
    SELECT ${groupExpression} AS periodDate,
      SUM(${qty("ProducedQuantity")}) AS produced,
      SUM(${qty("ReworkedQuantity")}) AS reworked,
      SUM(${qty("ScrappedQuantity")}) AS scrapped
    FROM dbo.vw_QA_WorkOrder
    ${scopedWhere(range, "COALESCE(ActualEndDate, SchedulingDate, ActualStartDate) IS NOT NULL")}
    GROUP BY ${groupExpression}
    ORDER BY periodDate;
  `);

    return result.recordset.map((row) => {
        const date = new Date(row.periodDate);
        const label = period === "monthly"
            ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
            : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date);

        return {
            label,
            produced: toNumber(row.produced),
            reworked: toNumber(row.reworked),
            scrapped: toNumber(row.scrapped)
        };
    });
}
