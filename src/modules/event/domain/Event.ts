import { EventCohost } from "./value-objects/EventCohost";
import { EventAttendee } from "./value-objects/EventAttendee";
import { Schedule } from "./value-objects/Schedule";
import { Location } from "./value-objects/Location";
import { EventCohostCollection } from "./collections/EventCohostCollection";
import { EventAttendeeCollection } from "./collections/EventAttendeeCollection";

export class Event {
  private constructor(
    public readonly id: string,
    private _title: string,
    private _description: string | undefined,
    private _categories: string[] | undefined,
    private _schedule: Schedule,
    private _location: Location | undefined,
    private _capacity: number | undefined,
    public readonly hostId: string,
    private _cohosts: EventCohostCollection,
    private _attendees: EventAttendeeCollection,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: {
    id: string;
    title: string;
    description?: string;
    categories?: string[];
    startDateTime: Date;
    endDateTime: Date;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    hostId: string;
    // cohostIds?: string[];
  }): Event {
    const schedule = Schedule.create(params.startDateTime, params.endDateTime);
    const location =
      params.latitude && params.longitude
        ? Location.create(params.latitude, params.longitude)
        : undefined;

    // const cohostVOs = (params.cohostIds || []).map((userId) =>
    //   EventCohost.create(userId, params.id)
    // );

    // Event.validateCohosts(cohostVOs, params.hostId);

    const cohosts = new EventCohostCollection();
    const attendees = new EventAttendeeCollection();

    const event = new Event(
      params.id,
      params.title,
      params.description,
      params.categories,
      schedule,
      location,
      params.capacity,
      params.hostId,
      cohosts,
      attendees,
      new Date(),
      new Date()
    );

    return event;
  }

  static reconstitute(params: {
    id: string;
    title: string;
    description?: string;
    categories?: string[];
    startDateTime: Date;
    endDateTime: Date;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    hostId: string;
    cohosts: Array<{ userId: string; eventId: string }>;
    attendees: Array<{ userId: string; eventId: string }>;
    createdAt: Date;
    updatedAt: Date;
  }): Event {
    const schedule = Schedule.create(params.startDateTime, params.endDateTime);
    const location =
      params.latitude && params.longitude
        ? Location.create(params.latitude, params.longitude)
        : undefined;

    const cohostVOs = params.cohosts.map((c) =>
      EventCohost.create(c.userId, c.eventId)
    );

    const attendeeVOs = params.attendees.map((a) =>
      EventAttendee.create(a.userId, a.eventId)
    );

    const cohosts = new EventCohostCollection(cohostVOs);
    const attendees = new EventAttendeeCollection(attendeeVOs);

    return new Event(
      params.id,
      params.title,
      params.description,
      params.categories,
      schedule,
      location,
      params.capacity,
      params.hostId,
      cohosts,
      attendees,
      params.createdAt,
      params.updatedAt
    );
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get categories(): string[] | undefined {
    return this._categories;
  }

  get startDateTime(): Date {
    return this._schedule.start;
  }

  get endDateTime(): Date {
    return this._schedule.end;
  }

  get latitude(): number | undefined {
    return this._location?.latitude;
  }

  get longitude(): number | undefined {
    return this._location?.longitude;
  }

  get capacity(): number | undefined {
    return this._capacity;
  }

  get cohosts(): EventCohost[] {
    return Array.from(this._cohosts);
  }

  get attendees(): EventAttendee[] {
    return Array.from(this._attendees);
  }

  get attendeeCount(): number {
    return this._attendees.count();
  }

  getCohostChanges(): {
    new: EventCohost[];
    removed: EventCohost[];
  } {
    return {
      new: this._cohosts.getNew(),
      removed: this._cohosts.getRemoved(),
    };
  }

  getAttendeeChanges(): {
    new: EventAttendee[];
    removed: EventAttendee[];
  } {
    return {
      new: this._attendees.getNew(),
      removed: this._attendees.getRemoved(),
    };
  }

  update(params: {
    title?: string;
    description?: string;
    categories?: string[];
    startDateTime?: Date;
    endDateTime?: Date;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    cohostIds?: string[];
  }): void {
    if (params.title !== undefined) {
      this._title = params.title;
    }

    if (params.description !== undefined) {
      this._description = params.description;
    }

    if (params.categories !== undefined) {
      this._categories = params.categories;
    }

    if (params.startDateTime && params.endDateTime) {
      this._schedule = Schedule.create(
        params.startDateTime,
        params.endDateTime
      );
    }

    if (params.latitude !== undefined && params.longitude !== undefined) {
      if (params.latitude === null || params.longitude === null) {
        this._location = undefined;
      } else {
        this._location = Location.create(params.latitude, params.longitude);
      }
    }

    if (params.capacity !== undefined) {
      this._capacity = params.capacity;
    }

    if (params.cohostIds !== undefined) {
      this.updateCohosts(params.cohostIds);
    }
  }

  private updateCohosts(newCohostIds: string[]): void {
    const newCohostVOs = newCohostIds.map((id) =>
      EventCohost.create(id, this.id)
    );

    Event.validateCohosts(newCohostVOs, this.hostId);

    const currentCohostIds = new Set(
      Array.from(this._cohosts).map((c) => c.userId)
    );
    const newCohostIdsSet = new Set(newCohostIds);

    for (const cohost of this._cohosts) {
      if (!newCohostIdsSet.has(cohost.userId)) {
        this._cohosts.registerRemoved(cohost);
      }
    }

    for (const userId of newCohostIds) {
      if (!currentCohostIds.has(userId)) {
        const cohost = EventCohost.create(userId, this.id);
        this._cohosts.registerNew(cohost);
      }
    }
  }

  addAttendee(userId: string): void {
    this.ensureNotHost(userId);
    this.ensureNotFull();
    this.ensureNotAlreadyAttending(userId);

    const attendee = EventAttendee.create(userId, this.id);
    this._attendees.registerNew(attendee);
  }

  removeAttendee(userId: string): void {
    this.ensureIsAttending(userId);

    const attendee = Array.from(this._attendees).find(
      (a) => a.userId === userId
    );
    if (attendee) {
      this._attendees.registerRemoved(attendee);
    }
  }

  ensureHost(userId: string): void {
    if (this.hostId !== userId) {
      throw new Error("You are not the host of this event");
    }
  }

  ensureNotHost(userId: string): void {
    if (this.hostId === userId) {
      throw new Error("Hosts cannot perform this action");
    }
  }

  markAsDeleted(): void {
    // Marked as deleted
  }

  private ensureNotFull(): void {
    if (this._capacity != null && this._attendees.count() >= this._capacity) {
      throw new Error("Event capacity is full.");
    }
  }

  private ensureNotAlreadyAttending(userId: string): void {
    const attendee = EventAttendee.create(userId, this.id);
    if (this._attendees.has(attendee)) {
      throw new Error("User is already attending this event.");
    }
  }

  private ensureIsAttending(userId: string): void {
    const attendee = EventAttendee.create(userId, this.id);
    if (!this._attendees.has(attendee)) {
      throw new Error("User is not attending this event.");
    }
  }

  static validateCohosts(cohosts: EventCohost[], hostId: string): void {
    const cohostIds = cohosts.map((c) => c.userId);
    const unique = new Set(cohostIds);

    if (unique.size !== cohostIds.length) {
      throw new Error("Cohost list cannot contain duplicates.");
    }

    if (cohostIds.includes(hostId)) {
      throw new Error("Host cannot be added as a cohost.");
    }
  }
}
