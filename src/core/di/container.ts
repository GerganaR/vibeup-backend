import { Container } from "inversify";
import { TYPES } from "./types";

import { SqlEventRepository } from "@/modules/event/infrastructure/sql/SqlEventRepository";
import { IEventRepository } from "@/modules/event/domain/repositories/IEventRepository";
import { EventApplicationService } from "@/modules/event/application/EventApplicationService";
import { EventController } from "@/modules/event/ui/event.controller";
import { SqlCategoryRepository } from "@/modules/category/infrastructure/sql/SqlCategoryRepository";
import { ICategoryRepository } from "@/modules/category/domain/repositories/ICategoryRepository";
import { CategoriesService } from "@/modules/category/application/CategoriesService";
import { CategoriesController } from "@/modules/category/ui/CategoriesController";

const container = new Container();

// Event Repository binding
container
  .bind<IEventRepository>(TYPES.IEventRepository)
  .to(SqlEventRepository)
  .inSingletonScope();

// Category Repository binding
container
  .bind<ICategoryRepository>(TYPES.ICategoryRepository)
  .to(SqlCategoryRepository)
  .inSingletonScope();

// App Service binding
container
  .bind<EventApplicationService>(TYPES.EventApplicationService)
  .to(EventApplicationService)
  .inSingletonScope();

// Categories Service binding
container
  .bind<CategoriesService>(TYPES.CategoriesService)
  .to(CategoriesService)
  .inSingletonScope();

// Event Controller binding
container
  .bind<EventController>(TYPES.EventController)
  .to(EventController)
  .inRequestScope();

// Categories Controller binding
container
  .bind<CategoriesController>(TYPES.CategoriesController)
  .to(CategoriesController)
  .inRequestScope();

// Domain Services
import { EventCategoryValidator } from "@/modules/event/domain/services/EventCategoryValidator";
container
  .bind<EventCategoryValidator>(TYPES.EventCategoryValidator)
  .to(EventCategoryValidator)
  .inSingletonScope();

// Migration Client
import { MigrationClient } from "@/core/infrastructure/persistence/MigrationClient";
container
  .bind<MigrationClient>(TYPES.MigrationClient)
  .to(MigrationClient)
  .inSingletonScope();

export { container };
