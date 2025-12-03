import { UserAggregate } from "../domain/UserAggregate";
import { UserIdentity } from "../userIdentity.entity";

export class UserMapper {
  static toDomain(userModel: UserIdentity): UserAggregate {
    const profile = userModel.profile;

    if (!profile) {
      throw new Error("UserProfile is required for UserAggregate");
    }

    return UserAggregate.reconstitute({
      id: userModel.id,
      googleId: userModel.googleId,
      name: profile.name,
      avatarUrl: profile.avatarUrl || undefined,
      email: profile.email,
      locale: profile.locale || undefined,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
    });
  }

  static toPersistence(user: UserAggregate): {
    id: string;
    googleId: string;
    name: string;
    avatarUrl?: string;
    email: string;
    locale?: string;
  } {
    return {
      id: user.id,
      googleId: user.googleId,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      locale: user.locale,
    };
  }
}

