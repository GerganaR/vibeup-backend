import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "@/core/di/types";
import { CategoriesService } from "../application/CategoriesService";

@injectable()
export class CategoriesController {
  constructor(
    @inject(TYPES.CategoriesService)
    private readonly categoriesService: CategoriesService
  ) {}

  async getAll(_req: Request, res: Response) {
    const categories = await this.categoriesService.getAllCategories();
    res.json(categories);
  }

  async getById(req: Request, res: Response) {
    const category = await this.categoriesService.getCategoryById(
      req.params.id
    );
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(category);
  }
}
