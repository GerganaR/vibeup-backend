import { sequelize } from "@/core/config/database";
import { UserProfile } from "./userProfile.entity";
import { UserIdentity } from "./userIdentity.entity";

export class UserRepository {
  async findByGoogleId(googleId: string) {
    return UserIdentity.findOne({
      where: { googleId },
      include: [UserProfile],
    });
  }

  async createWithProfile(data: {
    googleId: string;
    name?: string;
    avatarUrl?: string;
    email: string;
    locale?: string;
  }) {
    return await sequelize.transaction(async (t) => {
      const user = await UserIdentity.create(
        { googleId: data.googleId },
        { transaction: t }
      );

      await UserProfile.create(
        {
          id: user.id,
          name: data.name || "",
          avatarUrl: data.avatarUrl,
          email: data.email,
          locale: data.locale,
        },
        { transaction: t }
      );

      return await UserIdentity.findOne({
        where: { googleId: data.googleId },
        include: [UserProfile],
        transaction: t,
      });
    });
  }
  async findById(id: string) {
    return UserIdentity.findByPk(id, {
      include: [UserProfile],
    });
  }
}

export const userRepository = new UserRepository();
