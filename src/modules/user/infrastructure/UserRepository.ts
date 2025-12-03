import { IUserRepository } from "../domain/repositories/IUserRepository";
import { UserAggregate } from "../domain/UserAggregate";
import { UserIdentity } from "../userIdentity.entity";
import { UserProfile } from "../userProfile.entity";
import { UserMapper } from "./UserMapper";
import { sequelize } from "@/core/config/database";
import { Transaction } from "sequelize";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserAggregate | null> {
    const userModel = await UserIdentity.findOne({
      where: { id },
      include: [
        {
          model: UserProfile,
          as: "profile",
        },
      ],
    });

    if (!userModel) {
      return null;
    }

    return UserMapper.toDomain(userModel);
  }

  async findByGoogleId(googleId: string): Promise<UserAggregate | null> {
    const userModel = await UserIdentity.findOne({
      where: { googleId },
      include: [
        {
          model: UserProfile,
          as: "profile",
        },
      ],
    });

    if (!userModel) {
      return null;
    }

    return UserMapper.toDomain(userModel);
  }

  async save(user: UserAggregate): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      const userData = UserMapper.toPersistence(user);

      const [affectedRows] = await UserIdentity.update(
        { googleId: userData.googleId },
        {
          where: { id: user.id },
          transaction,
        }
      );

      if (affectedRows === 0) {
        await UserIdentity.create(
          {
            id: userData.id,
            googleId: userData.googleId,
          },
          { transaction }
        );
      }

      const [profileAffectedRows] = await UserProfile.update(
        {
          name: userData.name,
          avatarUrl: userData.avatarUrl,
          email: userData.email,
          locale: userData.locale,
        },
        {
          where: { id: user.id },
          transaction,
        }
      );

      if (profileAffectedRows === 0) {
        await UserProfile.create(
          {
            id: userData.id,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
            email: userData.email,
            locale: userData.locale,
          },
          { transaction }
        );
      }
    });
  }
}

