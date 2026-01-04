import type { GoogleAuthenticatedUser } from "@/modules/auth/auth.types";
import type { UserResponseDTO } from "@/modules/user/application/UserResponseDTO";

declare global {
  namespace Express {
    interface Request {
      authenticatedGoogleUser?: GoogleAuthenticatedUser;
      authenticatedUser?: UserResponseDTO;
    }
  }
}

export {};

