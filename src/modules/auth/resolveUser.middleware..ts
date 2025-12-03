import { Request, Response, NextFunction } from "express";
import { UserApplicationService } from "../user/application/UserApplicationService";
import { UserResponseMapper } from "../user/application/UserResponseDTO";

// Dependency injection - in a real app, use a DI container
import { UserRepository } from "../user/infrastructure/UserRepository";
const userRepository = new UserRepository();
const userApplicationService = new UserApplicationService(userRepository);

export async function resolveUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const googleUser = req.authenticatedGoogleUser;

  if (!googleUser)
    return res.status(401).json({ message: "Google user missing" });

  try {
    const user = await userApplicationService.findOrCreateFromGoogle(googleUser);

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Map to response DTO for consistency with API shape
    req.authenticatedUser = UserResponseMapper.toDTO(user);
    return next();
  } catch (err) {
    console.error("resolveUser error:", err);
    return res.status(500).json({ message: "Failed to resolve user" });
  }
}
