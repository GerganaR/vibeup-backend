import { authMiddleware } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// POST /api/auth/oauth/callback
router.post("/oauth/callback", async (req, res) => {
  try {
    const { token, provider } = req.body;
    if (provider !== "google")
      return res.status(400).json({ message: "Unsupported provider" });

    const result = await AuthService.googleLogin(token);
    return res.json({
      token: result.token,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        picture: result.user.avatarUrl,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// GET /api/auth/user (protected)
router.get("/user", authMiddleware, async (req: any, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.avatarUrl,
  });
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const payload: any = AuthService.verifyRefreshToken(refreshToken);

    const token = jwt.sign({ id: payload.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token, refreshToken: newRefreshToken });
  } catch (err: any) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// POST /api/auth/logout (protected)
router.post("/logout", authMiddleware, async (_req, res) => {
  // For stateless JWT, you can just let frontend discard tokens
  res.json({ message: "Logged out successfully" });
});

export default router;
