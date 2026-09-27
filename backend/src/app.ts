import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { databaseRouter } from "./routes/database.routes.js";

export const app = express();

app.use(
    cors({
        origin: [env.clientUrl, "http://localhost",  "http://localhost:5173", "http://localhost:5174"]
    })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "QA Reporting API is running",
        environment: env.nodeEnv
    });
});
app.use("/api/dashboard", dashboardRouter);
app.use("/api/database", databaseRouter);