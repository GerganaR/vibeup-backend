import { DomainEvent } from "@/core/domain/DomainEvent";

export class CohostRemoved extends DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly userId: string
  ) {
    super(eventId);
  }

  getEventType(): string {
    return "CohostRemoved";
  }
}

