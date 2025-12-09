export class EventAttendee {
  private constructor(public readonly userId: string) {}

  static create(userId: string): EventAttendee {
    if (!userId) throw new Error("EventAttendee requires userId");
    return new EventAttendee(userId);
  }

  equals(other: EventAttendee): boolean {
    return this.userId === other.userId;
  }
}
