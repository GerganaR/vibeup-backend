import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
} from "sequelize-typescript";
import { EventModel } from "./EventModel";
import { CategoryModel } from "../../../../category/infrastructure/sequelize/models/CategoryModel";

@Table({
  tableName: "event_categories",
  timestamps: true,
})
export class EventCategoryModel extends Model {
  @ForeignKey(() => EventModel)
  @Column(DataType.UUID)
  eventId!: string;

  @ForeignKey(() => CategoryModel)
  @Column(DataType.UUID)
  categoryId!: string;

  @BelongsTo(() => EventModel, "eventId")
  event!: EventModel;

  @BelongsTo(() => CategoryModel, "categoryId")
  category!: CategoryModel;
}
