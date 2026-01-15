import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./core/config/database";
import { seedCategories } from "./core/config/seeders/CategorySeeder";
import { container } from "./core/di/container";
import { TYPES } from "./core/di/types";
import { MigrationClient } from "./core/infrastructure/persistence/MigrationClient";
import app from "./app";
import "reflect-metadata";

const PORT: number = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Sync only USER tables; event uses raw SQL
    await sequelize.sync({ alter: true });
    console.log("User models synced");

    // Run Migrations
    const migrationClient = container.get<MigrationClient>(
      TYPES.MigrationClient
    );
    await migrationClient.runMigrations();
    console.log("Migrations check completed");

    // Seed categories
    await seedCategories();
    console.log("Categories seeded");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`CORS enabled for: ${process.env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
