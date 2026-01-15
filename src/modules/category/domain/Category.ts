import { CategoryId } from "./CategoryId"


export class Category {
  private constructor(
    private readonly _id: CategoryId,
    private _name: string,
    public readonly createdAt: Date
  ) {}

  static create(id: string, name: string): Category {
    if (!name || name.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters");
    }
    return new Category(CategoryId.create(id), name.trim(), new Date());
  }

  static reconstitute(params: {
    id: string;
    name: string;
    createdAt: Date;
  }): Category {
    return new Category(
      CategoryId.create(params.id),
      params.name,
      params.createdAt
    );
  }

  get id(): CategoryId {
    return this._id;
  }

  get idValue(): string {
    return this._id.value;
  }

  get name(): string {
    return this._name;
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters");
    }
    this._name = newName.trim();
  }

  equals(other: Category): boolean {
    return this._id.equals(other._id);
  }
}
