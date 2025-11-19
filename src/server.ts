import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./config/database";
import app from "./app";

const PORT: number = parseInt(process.env.PORT || "5000", 10);

const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("📦 Models synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
