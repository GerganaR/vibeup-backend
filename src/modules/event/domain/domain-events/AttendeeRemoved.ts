import { DomainEvent } from "@/core/domain/DomainEvent";

export class AttendeeRemoved extends DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly userId: string
  ) {
    super(eventId);
  }

  getEventType(): string {
    return "AttendeeRemoved";
  }
}

