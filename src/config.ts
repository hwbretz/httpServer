import { MigrationConfig } from "drizzle-orm/migrator";
import { DBConfig } from "./DBconfig";
import { migrationConfig } from "./MigrationConfig.js";


process.loadEnvFile();

type APIConfig = {
    fileServerHits: number;
    platform: string;
    apiKey: string;
}

type Config = {
    api: APIConfig,
    db: DBConfig,
    secret: string,
}

function envOrThrow(key: string){
    if( process.env[key] && typeof process.env[key] === 'string'){
        return process.env[key];
    } else {
        throw new Error("Missing environment variable");
    }
}

export let config: Config = {
    api: {
        fileServerHits : 0,
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