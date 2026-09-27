import "dotenv/config";

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",

    port: Number(process.env.PORT ?? 5000),

    clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",

    database: {
        user: getRequiredEnv("DB_USER"),
        password: getRequiredEnv("DB_PASSWORD"),
        server: getRequiredEnv("DB_SERVER"),
        port: Number(process.env.DB_PORT ?? 1433),
        database: getRequiredEnv("DB_NAME"),
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate:
            process.env.DB_TRUST_SERVER_CERTIFICATE !== "false"
    }
};