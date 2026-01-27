import { migrationConfig } from "./MigrationConfig.js";
process.loadEnvFile();
function envOrThrow(key) {
    if (process.env[key] && typeof process.env[key] === 'string') {
        return process.env[key];
    }
    else {
        throw new Error("Missing environment variable");
    }
}
export let config = {
    api: {
        fileServerHits: 0,
        platform: envOrThrow("PLATFORM"),
        apiKey: envOrThrow("POLKA_KEY"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig
    },
    secret: envOrThrow("SECRET"),
};
//"postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable"
