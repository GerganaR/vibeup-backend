import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  Unique,
  HasOne,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { UserProfile } from "./userProfile.entity";
import { Event } from "../event/event.model";
import { EventAttendee } from "../event/eventAttendee.model";
import { EventCohost } from "../event/eventCohost.model";

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

  @HasMany(() => Event, "hostId")
  hostedEvents!: Event[];

  @HasMany(() => EventAttendee, "userId")
  eventAttendees!: EventAttendee[];

  @HasMany(() => EventCohost, "userId")
  eventCohosts!: EventCohost[];
}
