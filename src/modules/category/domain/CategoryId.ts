import { v4 as uuidv4, validate as uuidValidate } from "uuid";

export class CategoryId {
  private constructor(public readonly value: string) {}

  static create(id?: string): CategoryId {
    if (id) {
      if (!uuidValidate(id)) {
        throw new Error("Invalid category ID format");
      }
      return new CategoryId(id);
    }
    return new CategoryId(uuidv4());
  }

  static generate(): CategoryId {
    return new CategoryId(uuidv4());
  }

  equals(other: CategoryId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
