import type { GoogleAuthenticatedUser } from "@/modules/auth/auth.types";
import type { UserIdentity } from "@/modules/user/userIdentity.entity";

declare global {
  namespace Express {
    interface Request {
      authenticatedGoogleUser?: GoogleAuthenticatedUser;
      authenticatedUser?: UserIdentity;
    }
  }
}

export {};

