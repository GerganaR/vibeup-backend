import { injectable } from "inversify";
import fs from "fs";
import path from "path";
import { sequelize } from "@/core/config/database";
import { QueryInterface } from "sequelize";

@injectable()
export class MigrationClient {
  private readonly migrationTableName = "migrations";
  private readonly migrationsDir = path.join(
    __dirname,
    "../../config/migrations"
  );

  async runMigrations(): Promise<void> {
    console.log("🚀 Starting database migrations...");
    const queryInterface = sequelize.getQueryInterface();

    await this.ensureMigrationTable();

    const executedMigrations = await this.getExecutedMigrations();
    const result = await this.getMigrationFiles();

    // Sort migrations by name to ensure order
    const migrationFiles = result.sort();

    const pendingMigrations = migrationFiles.filter(
      (file) => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations found.");
      return;
    }

    console.log(`📦 Found ${pendingMigrations.length} pending migrations.`);

    for (const file of pendingMigrations) {
      await this.executeMigration(queryInterface, file);
    }

    console.log("✨ All migrations executed successfully.");
  }

  private async ensureMigrationTable() {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "${this.migrationTableName}" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "executed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const [results] = await sequelize.query(
        `SELECT name FROM "${this.migrationTableName}"`
      );
      return (results as any[]).map((row) => row.name);
    } catch (error) {
      console.error("Error fetching executed migrations:", error);
      return [];
    }
  }

  private async getMigrationFiles(): Promise<string[]> {
    if (!fs.existsSync(this.migrationsDir)) {
      console.warn(`Migration directory not found: ${this.migrationsDir}`);
      return [];
    }

    const files = fs.readdirSync(this.migrationsDir);
    return files.filter(
      (file) =>
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".d.ts") &&
        !file.endsWith(".map")
    );
  }

  private async executeMigration(
    queryInterface: QueryInterface,
    filename: string
  ) {
    console.log(`⏳ Executing migration: ${filename}...`);
    const filePath = path.join(this.migrationsDir, filename);

    // Dynamic import handling for both CommonJS (dist) and TS-Node (src)
    const migration = await import(filePath);

    if (!migration.up) {
      throw new Error(
        `Migration ${filename} relies on 'up' export, but it is missing.`
      );
    }

    try {
      await migration.up(queryInterface);

      await sequelize.query(
        `INSERT INTO "${this.migrationTableName}" (name) VALUES (:name)`,
        {
          replacements: { name: filename },
        }
      );
      console.log(`✅ Migration ${filename} completed.`);
    } catch (error) {
      console.error(`❌ Migration ${filename} failed:`, error);
      throw error;
    }
  }
}
