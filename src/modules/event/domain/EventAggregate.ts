import { EventCohost } from "./value-objects/EventCohost";
import { EventAttendee } from "./value-objects/EventAttendee";
import { Schedule } from "./value-objects/Schedule";
import { Location } from "./value-objects/Location";
import { EventCreated } from "./domain-events/EventCreated";
import { EventUpdated } from "./domain-events/EventUpdated";
import { EventDeleted } from "./domain-events/EventDeleted";
import { AttendeeAdded } from "./domain-events/AttendeeAdded";
import { AttendeeRemoved } from "./domain-events/AttendeeRemoved";
import { CohostAdded } from "./domain-events/CohostAdded";
import { CohostRemoved } from "./domain-events/CohostRemoved";
import { DomainEvent } from "@/core/domain/DomainEvent";
import { EventCohostCollection } from "./collections/EventCohostCollection";
import { EventAttendeeCollection } from "./collections/EventAttendeeCollection";

export class EventAggregate {
  private domainEvents: DomainEvent[] = [];

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
    cohostIds?: string[];
  }): EventAggregate {
    const schedule = Schedule.create(params.startDateTime, params.endDateTime);
    const location =
      params.latitude && params.longitude
        ? Location.create(params.latitude, params.longitude)
        : undefined;

    const cohostVOs = (params.cohostIds || []).map((userId) =>
      EventCohost.create(userId, params.id)
    );

    EventAggregate.validateCohosts(cohostVOs, params.hostId);

    const cohosts = new EventCohostCollection(cohostVOs);
    const attendees = new EventAttendeeCollection();

    const event = new EventAggregate(
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

    event.addDomainEvent(new EventCreated(event.id, event.hostId));

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
  }): EventAggregate {
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

    return new EventAggregate(
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

    this.addDomainEvent(new EventUpdated(this.id));
  }

  private updateCohosts(newCohostIds: string[]): void {
    const newCohostVOs = newCohostIds.map((id) =>
      EventCohost.create(id, this.id)
    );

    EventAggregate.validateCohosts(newCohostVOs, this.hostId);

    const currentCohostIds = new Set(
      Array.from(this._cohosts).map((c) => c.userId)
    );
    const newCohostIdsSet = new Set(newCohostIds);

    for (const cohost of this._cohosts) {
      if (!newCohostIdsSet.has(cohost.userId)) {
        this._cohosts.registerRemoved(cohost);
        this.addDomainEvent(new CohostRemoved(this.id, cohost.userId));
      }
    }

    for (const userId of newCohostIds) {
      if (!currentCohostIds.has(userId)) {
        const cohost = EventCohost.create(userId, this.id);
        this._cohosts.registerNew(cohost);
        this.addDomainEvent(new CohostAdded(this.id, userId));
      }
    }
  }

  addAttendee(userId: string): void {
    this.ensureNotHost(userId);
    this.ensureNotFull();
    this.ensureNotAlreadyAttending(userId);

    const attendee = EventAttendee.create(userId, this.id);
    this._attendees.registerNew(attendee);
    this.addDomainEvent(new AttendeeAdded(this.id, userId));
  }

  removeAttendee(userId: string): void {
    this.ensureIsAttending(userId);

    const attendee = Array.from(this._attendees).find(
      (a) => a.userId === userId
    );
    if (attendee) {
      this._attendees.registerRemoved(attendee);
      this.addDomainEvent(new AttendeeRemoved(this.id, userId));
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
    this.addDomainEvent(new EventDeleted(this.id));
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

  private static validateCohosts(cohosts: EventCohost[], hostId: string): void {
    const cohostIds = cohosts.map((c) => c.userId);
    const unique = new Set(cohostIds);

    if (unique.size !== cohostIds.length) {
      throw new Error("Cohost list cannot contain duplicates.");
    }

    if (cohostIds.includes(hostId)) {
      throw new Error("Host cannot be added as a cohost.");
    }
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
