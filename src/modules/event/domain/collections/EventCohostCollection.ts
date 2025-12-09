import { TrackedValueObjectCollection } from "@/core/domain/trackValueObjectCollection";
import { EventCohost } from "../value-objects/EventCohost";

export class EventCohostCollection extends TrackedValueObjectCollection<EventCohost> {
  protected getType(): new (...args: any[]) => EventCohost {
    return EventCohost as unknown as new (...args: any[]) => EventCohost;
  }

  protected getHash(value: EventCohost): string {
    return value.userId;
  }
}
