import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  IsEmail,
  Unique,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Event } from "./Event.model";
import { EventAttendee } from "./EventAttendee.model";
import { EventCohost } from "./EventCohost.model";

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

  @Unique
  @Column(DataType.STRING)
  googleId!: string;

  @HasMany(() => Event, "hostId")
  hostedEvents!: Event[];

  @HasMany(() => EventAttendee, "userId")
  eventAttendees!: EventAttendee[];

  @HasMany(() => EventCohost, "userId")
  eventCohosts!: EventCohost[];
}
