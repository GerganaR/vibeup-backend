import { Request, Response } from "express";
import { wrapController } from "@/core/utils/wrapController";

export class UserController {
  async getMe(req: Request, res: Response) {
    res.json(req.authenticatedUser);
  }
}

export const userController = wrapController(new UserController());
