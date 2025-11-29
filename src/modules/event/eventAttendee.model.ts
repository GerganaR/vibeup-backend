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
import { UserEntity } from "../user/user.entity";

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

  @ForeignKey(() => UserEntity)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => Event, "eventId")
  event!: Event;

  @BelongsTo(() => UserEntity, "userId")
  user!: UserEntity;
}
