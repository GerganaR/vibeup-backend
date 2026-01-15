import { Router, Request, Response } from "express";
import { container } from "@/core/di/container";
import { TYPES } from "@/core/di/types";
import { CategoriesController } from "./CategoriesController";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = container.get<CategoriesController>(
  TYPES.CategoriesController
);

router.get(
  "/",
  asyncHandler((req: Request, res: Response) => controller.getAll(req, res))
);
router.get(
  "/:id",
  asyncHandler((req: Request, res: Response) => controller.getById(req, res))
);

export default router;
