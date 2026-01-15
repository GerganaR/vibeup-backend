import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { EventAttendeeModel } from "./EventAttendeeModel";
import { EventCohostModel } from "./EventCohostModel";
import { EventCategoryModel } from "./EventCategoryModel";

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

  @Column(DataType.DATE)
  startDateTime!: Date;

  @Column(DataType.DATE)
  endDateTime!: Date;

  @Column(DataType.TEXT)
  address!: string;

  @Column(DataType.FLOAT)
  latitude?: number;

  @Column(DataType.FLOAT)
  longitude?: number;

  @Column(DataType.INTEGER)
  capacity?: number;

  @Column(DataType.UUID)
  hostId!: string;

  @HasMany(() => EventAttendeeModel)
  attendees!: EventAttendeeModel[];

  @HasMany(() => EventCohostModel)
  cohosts!: EventCohostModel[];

  @HasMany(() => EventCategoryModel)
  categories!: EventCategoryModel[];
}
