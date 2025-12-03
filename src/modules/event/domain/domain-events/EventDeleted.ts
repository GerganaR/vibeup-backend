import { DomainEvent } from "@/core/domain/DomainEvent";

export class EventDeleted extends DomainEvent {
  constructor(public readonly eventId: string) {
    super(eventId);
  }

  getEventType(): string {
    return "EventDeleted";
  }
}

