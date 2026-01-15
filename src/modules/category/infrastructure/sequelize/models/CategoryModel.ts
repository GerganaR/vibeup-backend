import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "categories",
  timestamps: true,
  updatedAt: false,
})
export class CategoryModel extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt!: Date;
}
