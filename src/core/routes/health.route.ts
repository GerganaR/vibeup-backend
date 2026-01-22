import { Router, Request, Response } from "express";
import { sequelize } from "@/core/config/database";

const healthRouter = Router();

healthRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    await sequelize.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

export default healthRouter;
