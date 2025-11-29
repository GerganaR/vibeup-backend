import { Router } from "express";
import { verifyGoogleToken } from "../auth/verifyGoogleToken.middleware";
import { resolveUser } from "../auth/resolveUser.middleware.";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", verifyGoogleToken, resolveUser, userController.getMe);

export default router;
