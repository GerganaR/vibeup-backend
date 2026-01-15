import { injectable } from "inversify";
import { sequelize } from "@/core/config/database";
import { QueryTypes } from "sequelize";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/Category";

interface CategoryRow {
  id: string;
  name: string;
  created_at: Date;
}

@injectable()
export class SqlCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const rows = await sequelize.query<CategoryRow>(
      `SELECT id, name, created_at FROM categories WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) return [];

    const rows = await sequelize.query<CategoryRow>(
      `SELECT id, name, created_at FROM categories WHERE id = ANY($1)`,
      { bind: [ids], type: QueryTypes.SELECT }
    );

    return rows.map((row) => this.toDomain(row));
  }

  async findAll(): Promise<Category[]> {
    const rows = await sequelize.query<CategoryRow>(
      `SELECT id, name, created_at FROM categories ORDER BY name ASC`,
      { type: QueryTypes.SELECT }
    );

    return rows.map((row) => this.toDomain(row));
  }

  async save(category: Category): Promise<void> {
    await sequelize.query(
      `INSERT INTO categories (id, name, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      {
        bind: [category.idValue, category.name, category.createdAt],
        type: QueryTypes.INSERT,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await sequelize.query(`DELETE FROM categories WHERE id = $1`, {
      bind: [id],
    });
  }

  async existsAll(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;

    const rows = await sequelize.query<{ count: string }>(
      `SELECT COUNT(DISTINCT id)::text as count FROM categories WHERE id = ANY($1)`,
      { bind: [ids], type: QueryTypes.SELECT }
    );

    const count = parseInt(rows[0]?.count || "0", 10);
    return count === ids.length;
  }

  private toDomain(row: CategoryRow): Category {
    return Category.reconstitute({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    });
  }
}
