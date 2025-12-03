import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Event } from "./event.model";
import { UserIdentity } from "../user/userIdentity.entity";

@Table({
  tableName: "event_attendees",
  timestamps: true,
})
export class EventAttendee extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Event)
  @Column(DataType.UUID)
  eventId!: string;

  @ForeignKey(() => UserIdentity)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => Event, "eventId")
  event!: Event;

  @BelongsTo(() => UserIdentity, "userId")
  user!: UserIdentity;
}
