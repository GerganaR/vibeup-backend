import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  Unique,
  HasOne,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { UserProfile } from "./userProfile.entity";

@Table({ tableName: "user_identities", timestamps: true })
export class UserIdentity extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  googleId!: string;

  @HasOne(() => UserProfile)
  profile!: UserProfile;
}
