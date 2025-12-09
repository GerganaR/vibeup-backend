export class EventCohost {
  private constructor(public readonly userId: string) {}

  static create(userId: string): EventCohost {
    if (!userId) throw new Error("EventCohost requires userId");
    return new EventCohost(userId);
  }

  equals(other: EventCohost): boolean {
    return this.userId === other.userId;
  }
}
