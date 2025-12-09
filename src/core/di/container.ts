import { Container } from "inversify";
import { TYPES } from "./types";

import { SqlEventRepository } from "@/modules/event/infrastructure/sql/SqlEventRepository";
import { IEventRepository } from "@/modules/event/domain/repositories/IEventRepository";
import { EventApplicationService } from "@/modules/event/application/EventApplicationService";
import { EventController } from "@/modules/event/ui/event.controller";

const container = new Container();

// Repository binding
container.bind<IEventRepository>(TYPES.IEventRepository)
  .to(SqlEventRepository)
  .inSingletonScope();

// App Service binding
container.bind<EventApplicationService>(TYPES.EventApplicationService)
  .to(EventApplicationService)
  .inSingletonScope();

// Controller binding
container.bind<EventController>(TYPES.EventController)
  .to(EventController)
  .inRequestScope();

export { container };
