import { Router, Request, Response } from "express";
// import { authMiddleware } from "../middleware/auth.middleware";
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

// /**
//  * Auth Routes
//  * All routes are prefixed with /api/auth
//  */

// // POST /api/auth/oauth/callback
// router.post("/oauth/callback", (req, res) =>
//   authController.googleOAuthCallback(req, res)
// );

// // GET /api/auth/user (protected)
// router.get("/user", authMiddleware, (req, res) =>
//   authController.getCurrentUser(req, res)
// );

// // POST /api/auth/refresh
// router.post("/refresh", (req, res) => authController.refreshToken(req, res));

// // POST /api/auth/logout (protected)
// router.post("/logout", authMiddleware, (req, res) =>
//   authController.logout(req, res)
// );

export default router;
