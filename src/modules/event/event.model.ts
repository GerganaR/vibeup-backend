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
import { UserEntity } from "../user/user.entity";
import { EventAttendee } from "./eventAttendee.model";
import { EventCohost } from "./eventCohost.model";

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

  @ForeignKey(() => UserEntity)
  @Column(DataType.UUID)
  hostId!: string;

  @BelongsTo(() => UserEntity, "hostId")
  host!: UserEntity;

  @HasMany(() => EventAttendee)
  attendees!: EventAttendee[];

  @HasMany(() => EventCohost)
  cohosts!: EventCohost[];
}
