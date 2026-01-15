import { GoogleAuthenticatedUser } from "../auth/auth.types";
import { userRepository } from "./user.repository";

export class UserService {
  async findOrCreateFromGoogle(googleUser: GoogleAuthenticatedUser) {
    const existing = await userRepository.findByGoogleId(googleUser.googleId);

    if (existing) return existing;

    return await userRepository.createWithProfile({
      googleId: googleUser.googleId,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      email: googleUser.email,
      locale: googleUser.locale,
    });
  }

  async findById(userId: string) {
    return await userRepository.findById(userId);
  }
}

export const userService = new UserService();
