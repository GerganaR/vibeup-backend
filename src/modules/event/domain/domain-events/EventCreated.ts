import { DomainEvent } from "@/core/domain/DomainEvent";

export class EventCreated extends DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly hostId: string
  ) {
    super(eventId);
  }

  getEventType(): string {
    return "EventCreated";
  }
}

