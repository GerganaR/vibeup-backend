import { Router } from "express";
import { verifyGoogleToken } from "../auth/verifyGoogleToken.middleware";
import { resolveUser } from "../auth/resolveUser.middleware.";
import { eventController } from "./event.controller";

const router = Router();

router.get("/", eventController.getAll.bind(eventController));
router.get("/:id", eventController.getById.bind(eventController));


router.post(
  "/",
  verifyGoogleToken,
  resolveUser,
  eventController.create.bind(eventController)
);

router.put(
  "/:id",
  verifyGoogleToken,
  resolveUser,
  eventController.update.bind(eventController)
);

router.delete(
  "/:id",
  verifyGoogleToken,
  resolveUser,
  eventController.delete.bind(eventController)
);

router.post(
  "/:id/rsvp",
  verifyGoogleToken,
  resolveUser,
  eventController.rsvp.bind(eventController)
);

router.delete(
  "/:id/rsvp",
  verifyGoogleToken,
  resolveUser,
  eventController.cancelRsvp.bind(eventController)
);

export default router;
