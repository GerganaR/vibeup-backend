import { DomainEvent } from "@/core/domain/DomainEvent";

export class EventUpdated extends DomainEvent {
  constructor(public readonly eventId: string) {
    super(eventId);
  }

  getEventType(): string {
    return "EventUpdated";
  }
}

