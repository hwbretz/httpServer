import { MigrationConfig } from "drizzle-orm/migrator"

export type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig,
}