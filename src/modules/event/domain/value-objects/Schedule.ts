export class Schedule {
  private constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {}

  static create(start: Date, end: Date): Schedule {
    if (new Date(start) >= new Date(end)) {
      throw new Error("Event start time must be before end time.");
    }

    return new Schedule(new Date(start), new Date(end));
  }

  equals(other: Schedule): boolean {
    return (
      this.start.getTime() === other.start.getTime() &&
      this.end.getTime() === other.end.getTime()
    );
  }
}

