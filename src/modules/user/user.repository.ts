import { sequelize } from "@/core/config/database";
import { UserEntity } from "./user.entity";
import { UserProfile } from "./userProfile.entity";

export class UserRepository {
  async findByGoogleId(googleId: string) {
    return UserEntity.findOne({
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
      const user = await UserEntity.create(
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

      return await UserEntity.findOne({
        where: { googleId: data.googleId },
        include: [UserProfile],
        transaction: t,
      });
    });
  }
}

export const userRepository = new UserRepository();
