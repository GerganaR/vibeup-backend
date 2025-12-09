import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { EventAttendeeModel } from "./EventAttendeeModel";
import { EventCohostModel } from "./EventCohostModel";
import { UserIdentity } from "../../../user/userIdentity.entity";

@Table({
  tableName: "events",
  timestamps: true,
})
export class EventModel extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.ARRAY(DataType.STRING))
  categories?: string[];

  @Column(DataType.DATE)
  startDateTime!: Date;

  @Column(DataType.DATE)
  endDateTime!: Date;

  @Column(DataType.FLOAT)
  latitude?: number;

  @Column(DataType.FLOAT)
  longitude?: number;

  @Column(DataType.INTEGER)
  capacity?: number;

  @ForeignKey(() => UserIdentity)
  @Column(DataType.UUID)
  hostId!: string;

  @BelongsTo(() => UserIdentity, "hostId")
  host!: UserIdentity;

  @HasMany(() => EventAttendeeModel)
  attendees!: EventAttendeeModel[];

  @HasMany(() => EventCohostModel)
  cohosts!: EventCohostModel[];
}
