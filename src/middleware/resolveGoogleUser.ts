import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository";

export async function resolveGoogleUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const googleUser = req.authenticatedGoogleUser;

  if (!googleUser?.googleId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Google user not found in token" });
  }

  const { googleId, email, name, picture } = googleUser;

  try {
    // 1. find or create the user
    const { user, created } = await userRepository.findOrCreateByGoogleId(
      googleId,
      {
        email: email || "",
        name: name || "",
        avatarUrl: picture,
      }
    );

    // 2. If user exists but profile info is missing/changed, update profile
    const needUpdate =
      (!user.email && email) ||
      (!user.name && name) ||
      (!user.avatarUrl && picture);

    if (!created && needUpdate) {
      await userRepository.updateProfile(user.id, {
        name: user.name || name,
        avatarUrl: user.avatarUrl || picture,
      });
    }

    // 3. Attach user to request
    req.authenticatedUser = user;

    return next();
  } catch (err) {
    console.error("ResolveGoogleUser error:", err);
    return res
      .status(500)
      .json({ message: "Failed to resolve user from Google token" });
  }
}
