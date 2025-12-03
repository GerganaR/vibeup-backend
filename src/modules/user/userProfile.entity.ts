import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { UserIdentity } from "./userIdentity.entity";


@Table({ tableName: "user_profiles", timestamps: true })
export class UserProfile extends Model {
  @PrimaryKey
  @ForeignKey(() => UserIdentity)
  @Column(DataType.UUID)
  id!: string;

  @BelongsTo(() => UserIdentity)
  user!: UserIdentity;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.TEXT)
  locale?: string;
}
