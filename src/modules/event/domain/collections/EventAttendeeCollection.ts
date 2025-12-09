import { TrackedValueObjectCollection } from "@/core/domain/trackValueObjectCollection";
import { EventAttendee } from "../value-objects/EventAttendee";

export class EventAttendeeCollection extends TrackedValueObjectCollection<EventAttendee> {
  protected getType(): new (...args: any[]) => EventAttendee {
    return EventAttendee as unknown as new (...args: any[]) => EventAttendee;
  }

  protected getHash(value: EventAttendee): string {
    return value.userId;
  }
}
