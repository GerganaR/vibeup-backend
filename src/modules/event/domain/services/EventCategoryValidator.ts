import { injectable, inject } from "inversify";
import { TYPES } from "@/core/di/types";
import { ICategoryRepository } from "@/modules/category/domain/repositories/ICategoryRepository";
import { BadRequestError } from "@/core/errors/httpErrors";

@injectable()
export class EventCategoryValidator {
  constructor(
    @inject(TYPES.ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async validateCategoriesExist(categoryIds: string[]): Promise<void> {
    if (!categoryIds || categoryIds.length === 0) return;

    const allExist = await this.categoryRepository.existsAll(categoryIds);
    if (!allExist) {
      throw new BadRequestError("One or more category IDs are invalid");
    }
  }
}
