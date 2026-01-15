import { injectable, inject } from "inversify";
import { TYPES } from "@/core/di/types";
import { ICategoryRepository } from "../domain/repositories/ICategoryRepository";
import { Category } from "../domain/Category";

// DTO for API responses
export interface CategoryDTO {
  id: string;
  name: string;
}

@injectable()
export class CategoriesService {
  constructor(
    @inject(TYPES.ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async getAllCategories(): Promise<CategoryDTO[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(this.toDTO);
  }

  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    const category = await this.categoryRepository.findById(id);
    return category ? this.toDTO(category) : null;
  }

  async getCategoriesByIds(ids: string[]): Promise<CategoryDTO[]> {
    const categories = await this.categoryRepository.findByIds(ids);
    return categories.map(this.toDTO);
  }

  async validateCategoriesExist(ids: string[]): Promise<boolean> {
    return this.categoryRepository.existsAll(ids);
  }

  private toDTO(category: Category): CategoryDTO {
    return {
      id: category.idValue,
      name: category.name,
    };
  }
}
