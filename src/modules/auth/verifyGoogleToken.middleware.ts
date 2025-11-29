import { Request, Response, NextFunction } from "express";
import { googleAuthService } from "./googleAuth.service";

export async function verifyGoogleToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing token" });

  const token = auth.split(" ")[1];

  try {
    const googleUser = await googleAuthService.verifyIdToken(token);
    req.authenticatedGoogleUser = googleUser;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid Google token" });
  }
}
