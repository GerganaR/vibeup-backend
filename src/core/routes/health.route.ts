import { Router, Request, Response } from "express";
import { sequelize } from "@/core/config/database";

const healthRouter = Router();

/**
 * Server-only health check
 * UptimeRobot should hit this every minute
 */
healthRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", database: "not checked" });
});

/**
 * Database health check
 * Can be pinged less frequently (every 5-15 minutes)
 */
healthRouter.get("/db-health", async (_req: Request, res: Response) => {
  try {
    await sequelize.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

export default healthRouter;