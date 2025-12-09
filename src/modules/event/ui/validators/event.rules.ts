import { Event } from "../../domain/Event";

export class EventRules {
  /**
   * Start date must be before end date.
   */
  static validateDates(start: Date, end: Date) {
    if (new Date(start) >= new Date(end)) {
      throw new Error("Event start time must be before end time.");
    }
  }

  /**
   * No duplicate cohosts.
   */
  static ensureNoDuplicateCohosts(cohostIds: string[]) {
    if (!cohostIds) return;

    const unique = new Set(cohostIds);
    if (unique.size !== cohostIds.length) {
      throw new Error("Cohost list cannot contain duplicates.");
    }
  }

  /**
   * Host cannot be included as a cohost.
   */
  static ensureCohostNotHost(cohostIds: string[], hostId: string) {
    if (!cohostIds) return;

    if (cohostIds.includes(hostId)) {
      throw new Error("Host cannot be added as a cohost.");
    }
  }

  /**
   * Event must not be full (capacity check).
   */
  static ensureEventNotFull(event: Event) {
    if (event.capacity != null) {
      const attendingCount = event.attendees?.length ?? 0;
      if (attendingCount >= event.capacity) {
        throw new Error("Event capacity is full.");
      }
    }
  }

  /**
   * User must not already be attending the event.
   */
  static ensureNotAttending(event: Event, userId: string) {
    const attending = event.attendees?.some((a: any) => a.userId === userId);
    if (attending) {
      throw new Error("User is already attending this event.");
    }
  }

  /**
   * User must already be attending to cancel RSVP.
   */
  static ensureIsAttending(event: Event, userId: string) {
    const attending = event.attendees?.some((a: any) => a.userId === userId);
    if (!attending) {
      throw new Error("User is not attending this event.");
    }
  }
}
