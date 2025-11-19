import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sequelize } from "./config/database";
import authRoutes from "./routes/auth.routes";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use("/api/auth", authRoutes);

// Health check route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Database health check
app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query("SELECT NOW() as now");
    res.status(200).json({
      status: "OK",
      message: "Database connected",
      timestamp: (result[0] as any)[0]?.now,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: errorMessage,
    });
  }
});

// API Routes
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to VibeUp API",
    version: "1.0.0",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "ERROR",
    message: "Route not found",
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.stack);
  res.status((err as any).status || 500).json({
    status: "ERROR",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true }); // create or update tables
    console.log("📦 Models synced");
  } catch (error) {
    console.error("❌ Database error:", error);
  }
})();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
});
