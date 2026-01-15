import { Category } from "../Category";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByIds(ids: string[]): Promise<Category[]>;
  findAll(): Promise<Category[]>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  existsAll(ids: string[]): Promise<boolean>;
}
