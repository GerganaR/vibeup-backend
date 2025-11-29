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
import { User } from "./User.model";
import { EventAttendee } from "./EventAttendee.model";
import { EventCohost } from "./EventCohost.model";

@Table({
  tableName: "events",
  timestamps: true,
})
export class Event extends Model {
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

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  hostId!: string;

  @BelongsTo(() => User, "hostId")
  host!: User;

  @HasMany(() => EventAttendee)
  attendees!: EventAttendee[];

  @HasMany(() => EventCohost)
  cohosts!: EventCohost[];
}
