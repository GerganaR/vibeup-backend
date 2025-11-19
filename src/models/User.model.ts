import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  IsEmail,
  Unique,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @IsEmail
  @Unique
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  // OAuth provider: google, github, apple, etc., For now only google is supported
  // TODO: Add other providers and create UserIdentity model
  @Unique
  @Column(DataType.STRING)
  googleId!: string;
}
