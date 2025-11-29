import { Router } from "express";
import userRoutes from "@/modules/user/user.routes";
import eventRoutes from "@/modules/event/event.routes";

const router = Router();

router.use("/api/users", userRoutes);
router.use("/api/events", eventRoutes);

export default router;
