import type { GoogleAuthenticatedUser } from "@/modules/auth/auth.types";
import type { UserEntity } from "@/modules/user/user.entity";

declare global {
  namespace Express {
    interface Request {
      authenticatedGoogleUser?: GoogleAuthenticatedUser;
      authenticatedUser?: UserEntity;
    }
  }
}

export {};
