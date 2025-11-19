import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
