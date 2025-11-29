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
import { Event } from "./Event.model";
import { User } from "./User.model";

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

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => Event, "eventId")
  event!: Event;

  @BelongsTo(() => User, "userId")
  user!: User;
}
