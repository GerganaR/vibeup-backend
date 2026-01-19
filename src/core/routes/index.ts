import { Router } from "express";
import userRoutes from "@/modules/user/ui/user.routes";
import eventRoutes from "@/modules/event/ui/event.routes";
import categoriesRoutes from "@/modules/category/ui/categories.routes";

const router = Router();

router.use("/api/users", userRoutes);
router.use("/api/events", eventRoutes);
router.use("/api/categories", categoriesRoutes);

export default router;
