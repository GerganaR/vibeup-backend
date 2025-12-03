export class EventCohost {
  private constructor(
    public readonly userId: string,
    public readonly eventId: string
  ) {}

  static create(userId: string, eventId: string): EventCohost {
    if (!userId || !eventId) {
      throw new Error("EventCohost requires both userId and eventId");
    }

    return new EventCohost(userId, eventId);
  }

  equals(other: EventCohost): boolean {
    return this.userId === other.userId && this.eventId === other.eventId;
  }
}

