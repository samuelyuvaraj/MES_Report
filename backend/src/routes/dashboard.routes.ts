import { Router } from "express";
import { getDashboardSummary, getProductionTrend } from "../repositories/dashboard.repository.js";
import { parseDateRange } from "../utils/date-range.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (req, res) => {
    try {
        const range = parseDateRange(req.query.from, req.query.to);
        const summary = await getDashboardSummary(range);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error("Dashboard summary failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load dashboard summary",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

dashboardRouter.get("/trends", async (req, res) => {
    const requestedPeriod = req.query.period;
    const period = requestedPeriod === "weekly" || requestedPeriod === "monthly" ? requestedPeriod : "daily";

    try {
        const range = parseDateRange(req.query.from, req.query.to);
        const trend = await getProductionTrend(period, range);
        res.json({
            success: true,
            data: trend,
            message: trend.length === 0 ? "Historical production data is unavailable for the selected period." : undefined
        });
    } catch (error) {
        console.error("Dashboard trends failed:", error);
        res.status(500).json({ success: false, message: "Unable to load dashboard trends" });
    }
});
