import { Request, Response } from "express";
import { UserApplicationService } from "../application/UserApplicationService";
import { UserResponseMapper } from "../application/UserResponseDTO";
import { wrapController } from "@/core/utils/wrapController";

export class UserController {
  constructor(
    private readonly userApplicationService: UserApplicationService
  ) {}

  async getMe(req: Request, res: Response): Promise<void> {
    const userId = req.authenticatedUser!.id;
    const user = await this.userApplicationService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(UserResponseMapper.toDTO(user));
  }
}

// Dependency injection setup
import { UserRepository } from "../infrastructure/UserRepository";
const userRepository = new UserRepository();
const userApplicationService = new UserApplicationService(userRepository);
export const userController = wrapController(
  new UserController(userApplicationService)
);
