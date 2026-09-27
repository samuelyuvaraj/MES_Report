import { app } from "./app.js";
import { env } from "./config/env.js";
import { getDb } from "./config/database.js";

async function startServer(): Promise<void> {
    try {
        await getDb();

        app.listen(env.port, () => {
            console.log(`QA Reporting API running on port ${env.port}`);
            console.log(`Health check: http://localhost:${env.port}/api/health`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

void startServer();