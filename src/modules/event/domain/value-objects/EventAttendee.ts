export class EventAttendee {
  private constructor(
    public readonly userId: string,
    public readonly eventId: string
  ) {}

  static create(userId: string, eventId: string): EventAttendee {
    if (!userId || !eventId) {
      throw new Error("EventAttendee requires both userId and eventId");
    }

    return new EventAttendee(userId, eventId);
  }

  equals(other: EventAttendee): boolean {
    return this.userId === other.userId && this.eventId === other.eventId;
  }
}

