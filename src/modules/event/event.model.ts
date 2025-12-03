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
import { EventAttendee } from "./eventAttendee.model";
import { EventCohost } from "./eventCohost.model";
import { UserIdentity } from "../user/userIdentity.entity";
// import { EventRules } from "./event.rules";
// import { UpdateEventDTO } from "./event.dto";

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

  @ForeignKey(() => UserIdentity)
  @Column(DataType.UUID)
  hostId!: string;

  @BelongsTo(() => UserIdentity, "hostId")
  host!: UserIdentity;

  @HasMany(() => EventAttendee)
  attendees!: EventAttendee[];

  @HasMany(() => EventCohost)
  cohosts!: EventCohost[];

  // // ---------- DOMAIN METHODS ----------
  // changeSchedule(start: Date, end: Date) {
  //   EventRules.validateDates(start, end);
  //   this.startDateTime = start;
  //   this.endDateTime = end;
  // }

  // updateCohosts(newIds: string[]) {
  //   const existing = this.cohosts.map(c => c.userId);

  //   const toAdd = newIds.filter(id => !existing.includes(id));
  //   const toRemove = existing.filter(id => !newIds.includes(id));

  //   this.setDataValue("cohostsToAdd", toAdd);
  //   this.setDataValue("cohostsToRemove", toRemove);
  // }

  // updateFromDTO(dto: UpdateEventDTO) {
  //   if (dto.title !== undefined) this.title = dto.title;
  //   if (dto.description !== undefined) this.description = dto.description;

  //   if (dto.startDateTime && dto.endDateTime) {
  //     this.changeSchedule(dto.startDateTime, dto.endDateTime);
  //   }

  //   if (dto.cohostIds) {
  //     EventRules.ensureNoDuplicateCohosts(dto.cohostIds);
  //     EventRules.ensureCohostNotHost(dto.cohostIds, this.hostId);

  //     this.updateCohosts(dto.cohostIds);
  //   }
  // }
}
