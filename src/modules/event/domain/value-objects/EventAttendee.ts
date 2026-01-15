export class EventAttendee {
  private constructor(
    public readonly userId: string,
    public readonly name: string = "Unknown",
    public readonly avatarUrl?: string
  ) {}

  static create(
    userId: string,
    name?: string,
    avatarUrl?: string
  ): EventAttendee {
    if (!userId) throw new Error("EventAttendee requires userId");
    return new EventAttendee(userId, name || "Unknown", avatarUrl);
  }

  equals(other: EventAttendee): boolean {
    return this.userId === other.userId;
  }
}
