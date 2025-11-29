import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import { UserEntity } from "./user.entity";

@Table({ tableName: "user_profiles", timestamps: true })
export class UserProfile extends Model {
  @PrimaryKey
  @ForeignKey(() => UserEntity)
  @Column(DataType.UUID)
  id!: string;

  @BelongsTo(() => UserEntity)
  user!: UserEntity;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.TEXT)
  locale?: string;
}
