import { Model, ModelStatic, FindOptions, WhereOptions } from "sequelize";

/**
 * Generic Base Repository
 * Provides common CRUD operations for all entities
 *
 * @template T - The model type (extends Sequelize Model)
 */
export class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  /**
   * Find entity by primary key
   */
  async findById(id: string | number): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  /**
   * Find one entity by criteria
   */
  async findOne(options: FindOptions<T>): Promise<T | null> {
    return await this.model.findOne(options);
  }

  /**
   * Find one entity by where clause
   */
  async findOneBy(where: WhereOptions<T>): Promise<T | null> {
    return await this.model.findOne({ where });
  }

  /**
   * Find all entities
   */
  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return await this.model.findAll(options);
  }

  /**
   * Find all entities by where clause
   */
  async findBy(
    where: WhereOptions<T>,
    options?: Omit<FindOptions<T>, "where">
  ): Promise<T[]> {
    return await this.model.findAll({ where, ...options });
  }

  /**
   * Find all entities with pagination
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    options?: FindOptions<T>
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T["_attributes"]>): Promise<T> {
    return await this.model.create(data as any);
  }

  /**
   * Create multiple entities
   */
  async createMany(data: Partial<T["_attributes"]>[]): Promise<T[]> {
    return await this.model.bulkCreate(data as any[]);
  }

  /**
   * Update entity by ID
   */
  async updateById(
    id: string | number,
    data: Partial<T["_attributes"]>
  ): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    await entity.update(data as any);
    return entity;
  }

  /**
   * Update entities by criteria
   */
  async updateBy(
    where: WhereOptions<T>,
    data: Partial<T["_attributes"]>
  ): Promise<number> {
    const [affectedCount] = await this.model.update(data as any, { where });
    return affectedCount;
  }

  /**
   * Delete entity by ID
   */
  async deleteById(id: string | number): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) return false;

    await entity.destroy();
    return true;
  }

  /**
   * Delete entities by criteria
   */
  async deleteBy(where: WhereOptions<T>): Promise<number> {
    return await this.model.destroy({ where });
  }

  /**
   * Count entities
   */
  async count(
    options?: Omit<FindOptions<T>, "limit" | "offset">
  ): Promise<number> {
    return await this.model.count(options);
  }

  /**
   * Count entities by where clause
   */
  async countBy(where: WhereOptions<T>): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if entity exists by ID
   */
  async existsById(id: string | number): Promise<boolean> {
    const count = await this.model.count({ where: { id } as any });
    return count > 0;
  }

  /**
   * Check if entity exists by criteria
   */
  async exists(where: WhereOptions<T>): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Find or create entity
   */
  async findOrCreate(options: {
    where: WhereOptions<T>;
    defaults?: Partial<T["_attributes"]>;
  }): Promise<{ entity: T; created: boolean }> {
    const [entity, created] = await this.model.findOrCreate({
      where: options.where,
      defaults: options.defaults as any,
    });

    return { entity, created };
  }

  /**
   * Soft delete (if model has paranoid: true)
   */
  async softDeleteById(id: string | number): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) return false;

    await entity.destroy();
    return true;
  }

  /**
   * Restore soft deleted entity (if model has paranoid: true)
   */
  async restore(id: string | number): Promise<boolean> {
    const entity = await this.model.findByPk(id, { paranoid: false });
    if (!entity) return false;

    await entity.restore();
    return true;
  }

  /**
   * Execute raw query using the model
   */
  async query(sql: string, replacements?: any): Promise<any> {
    return await this.model.sequelize?.query(sql, {
      replacements,
      model: this.model,
    });
  }

  /**
   * Begin transaction helper
   */
  async transaction<R>(callback: (transaction: any) => Promise<R>): Promise<R> {
    if (!this.model.sequelize) {
      throw new Error("Sequelize instance not available");
    }
    return await this.model.sequelize.transaction(callback);
  }
}
