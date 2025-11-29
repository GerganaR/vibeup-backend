import { Router, Request, Response } from "express";
import { verifyGoogleToken } from "@/middleware/verifyGoogleToken";
import { resolveGoogleUser } from "@/middleware/resolveGoogleUser";

const router = Router();

/**
 * GET /api/events
 * Get all events
 */
router.get("/", async (_req, _res) => {
  // TODO: Implement
  // Get all events -> attendees
  //                -> cohosts
  //   const events = await Event.findAll({
  //     include: [
  //       { model: EventAttendee, as: 'attendees' },
  //       { model: EventCohost, as: 'cohosts' },
  //     ],
  //     order: [["startDateTime", "ASC"]],
  //   });
});

/**
 * GET /api/events/:id
 * Get event by ID with relations
 */
router.get("/:id", async (_req, _res) => {
  // TODO: Implement
  // Get the event by id -> attendees
  //                     -> cohosts
});

/**
 * POST /api/events
 * Create a new event
 */
router.post(
  "/",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user (required - middleware ensures it exists):
    // const user = req.authenticatedUser;
    // TODO: Implement - Use transaction for event creation + cohosts
  }
);

/**
 * PUT /api/events/:id
 * Update an event
 */
router.put(
  "/:id",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user
    // const user = req.authenticatedUser!;
    // TODO: Check if user is the host of the event
    // TODO: Implement - Use transaction for event update + cohosts
  }
);

/**
 * DELETE /api/events/:id
 * Delete an event (only host can delete)
 */
router.delete(
  "/:id",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user
    // const user = req.authenticatedUser!;
    // TODO: Check if user is the host of the event
    // TODO: TRansaction - deleting event + attendees + cohosts c
  }
);

/**
 * POST /api/events/:id/rsvp
 * RSVP/Enroll to an event
 */
router.post(
  "/:id/rsvp",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user
    // const user = req.authenticatedUser!;
    // TODO: Implement - Use transaction for capacity check + creating attendee
  }
);

/**
 * DELETE /api/events/:id/rsvp
 * Cancel RSVP/Unenroll from an event
 */
router.delete(
  "/:id/rsvp",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user
    // const user = req.authenticatedUser!;
    // const { id } = req.params;
    // TODO: Implement - Use transaction for canceling RSVP
    // TODO: Implement - Use transaction for canceling RSVP
  }
);

/**
 * GET /api/events/my/events
 * Get events where user is the host
 */
router.get(
  "/my/events",
  verifyGoogleToken,
  resolveGoogleUser,
  async (_req: Request, _res: Response) => {
    // Access current user
    // const user = req.authenticatedUser!;
    // TODO: Implement
  }
);

export default router;
