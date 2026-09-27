import sql from "mssql";
import { env } from "./env.js";

const sqlConfig: sql.config = {
    user: env.database.user,
    password: env.database.password,
    server: env.database.server,
    port: env.database.port,
    database: env.database.database,
    options: {
        encrypt: env.database.encrypt,
        trustServerCertificate: env.database.trustServerCertificate
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
    if (pool?.connected) {
        return pool;
    }

    pool = await sql.connect(sqlConfig);
    return pool;
}

export async function closeDb(): Promise<void> {
    if (pool) {
        await pool.close();
        pool = null;
    }
}