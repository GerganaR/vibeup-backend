import { Router } from "express";
import { container } from "@/core/di/container";
import { TYPES } from "@/core/di/types";
import { EventController } from "./event.controller";
import { wrapController } from "@/core/utils/wrapController";
import { verifyGoogleToken } from "@/modules/auth/verifyGoogleToken.middleware";
import { resolveUser } from "@/modules/auth/resolveUser.middleware.";

const router = Router();

const controller = wrapController(
  container.get<EventController>(TYPES.EventController)
);

// Routes
// Dashboard Routes (must come before /:id)
router.get("/stats", verifyGoogleToken, resolveUser, controller.getStats);
router.get(
  "/attending",
  verifyGoogleToken,
  resolveUser,
  controller.getAttending
);
router.get("/hosted", verifyGoogleToken, resolveUser, controller.getHosted);

// Generic Routes
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.post("/", verifyGoogleToken, resolveUser, controller.create);
router.put("/:id", verifyGoogleToken, resolveUser, controller.update);
router.delete("/:id", verifyGoogleToken, resolveUser, controller.delete);

router.post("/:id/rsvp", verifyGoogleToken, resolveUser, controller.rsvp);
router.delete(
  "/:id/rsvp",
  verifyGoogleToken,
  resolveUser,
  controller.cancelRsvp
);

export default router;
