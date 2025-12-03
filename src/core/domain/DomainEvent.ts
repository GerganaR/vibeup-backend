export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId: string) {
    this.eventId = eventId;
    this.occurredOn = new Date();
  }

  abstract getEventType(): string;
}

