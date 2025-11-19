import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";

/**
 * Middleware to authenticate requests using JWT tokens
 * Validates the token and attaches the user to the request object
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Parse Bearer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const payload: any = authService.verifyAccessToken(token);

    // Get user from database
    const user = await userRepository.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
