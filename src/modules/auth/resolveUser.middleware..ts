import { Request, Response, NextFunction } from "express";
import { userService } from "../user/user.service";

export async function resolveUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const googleUser = req.authenticatedGoogleUser;

  if (!googleUser)
    return res.status(401).json({ message: "Google user missing" });

  try {
    const user = await userService.findOrCreateFromGoogle(googleUser);

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    req.authenticatedUser = user;
    return next();
  } catch (err) {
    console.error("resolveUser error:", err);
    return res.status(500).json({ message: "Failed to resolve user" });
  }
}
