import { Router } from "express";

import { getDashboardSummary } from "../repositories/dashboard.repository.js";
import { getDb } from "../config/database.js";
import { parseDateRange } from "../utils/date-range.js";

export const databaseRouter = Router();

databaseRouter.get("/test", async (_req, res) => {
    try {
        await (await getDb()).request().query("SELECT 1 AS connected");
        res.json({ success: true, message: "Database connection is available" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database connection failed", error: error instanceof Error ? error.message : String(error) });
    }
});

databaseRouter.get("/summary", async (_req, res) => {
    try {
        const summary = await getDashboardSummary(parseDateRange(undefined, undefined));

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error("Dashboard summary failed:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load dashboard summary"
        });
    }
});
