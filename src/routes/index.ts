import { Router } from "express";
import authRoutes from "./auth.routes";
import eventRoutes from "./event.routes";

const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/events", eventRoutes);

export default router;
