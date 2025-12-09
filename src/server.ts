import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./core/config/database";
import { initEventTables } from "./core/config/initEventTables";
import app from "./app";

const PORT: number = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Sync only USER tables; event uses raw SQL
    await sequelize.sync({ alter: true });
    console.log("User models synced");

    // Ensure Event tables exist (raw SQL)
    await initEventTables();
    console.log("Event tables ensured");

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
