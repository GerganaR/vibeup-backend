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
import { EventModel } from "./EventModel";
import { UserIdentity } from "../../../user/userIdentity.entity";

@Table({
  tableName: "event_attendees",
  timestamps: true,
})
export class EventAttendeeModel extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => EventModel)
  @Column(DataType.UUID)
  eventId!: string;

  @ForeignKey(() => UserIdentity)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => EventModel, "eventId")
  event!: EventModel;

  @BelongsTo(() => UserIdentity, "userId")
  user!: UserIdentity;
}
