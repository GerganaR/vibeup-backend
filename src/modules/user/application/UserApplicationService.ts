import { UserAggregate } from "../domain/UserAggregate";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { GoogleAuthenticatedUser } from "../../auth/auth.types";
import { v4 as uuidv4 } from "uuid";

export class UserApplicationService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findOrCreateFromGoogle(
    googleUser: GoogleAuthenticatedUser
  ): Promise<UserAggregate> {
    const existing = await this.userRepository.findByGoogleId(
      googleUser.googleId
    );

    if (existing) {
      return existing;
    }

    const user = UserAggregate.create({
      id: uuidv4(),
      googleId: googleUser.googleId,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      email: googleUser.email,
      locale: googleUser.locale,
    });

    await this.userRepository.save(user);
    return user;
  }

  async getUserById(id: string): Promise<UserAggregate | null> {
    return this.userRepository.findById(id);
  }
}

