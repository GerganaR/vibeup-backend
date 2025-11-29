import { Router, Request, Response } from "express";
import { verifyGoogleToken } from "@/middleware/verifyGoogleToken";
import { resolveGoogleUser } from "@/middleware/resolveGoogleUser";

const router = Router();

router.get(
  "/me",
  verifyGoogleToken,
  resolveGoogleUser,
  (req: Request, res: Response) => {
    res.json(req.authenticatedUser);
  }
);

export default router;
