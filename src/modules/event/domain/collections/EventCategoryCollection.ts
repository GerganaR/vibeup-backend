import { TrackedValueObjectCollection } from "@/core/domain/trackValueObjectCollection";
import { EventCategory } from "../value-objects/EventCategory";

export class EventCategoryCollection extends TrackedValueObjectCollection<EventCategory> {
  protected getType(): new (...args: any[]) => EventCategory {
    return EventCategory as unknown as new (...args: any[]) => EventCategory;
  }

  protected getHash(value: EventCategory): string {
    return value.categoryId;
  }
}
