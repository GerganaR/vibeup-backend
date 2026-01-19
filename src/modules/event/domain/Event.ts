import { EventCohost } from "./value-objects/EventCohost";
import { EventAttendee } from "./value-objects/EventAttendee";
import { EventCategory } from "./value-objects/EventCategory";
import { Schedule } from "./value-objects/Schedule";
import { Location } from "./value-objects/Location";
import { EventCohostCollection } from "./collections/EventCohostCollection";
import { EventAttendeeCollection } from "./collections/EventAttendeeCollection";
import { EventCategoryCollection } from "./collections/EventCategoryCollection";

export class Event {
  private _host?: { id: string; name: string; avatarUrl?: string };

  private constructor(
    public readonly id: string,
    private _title: string,
    private _description: string | undefined,
    private _categories: EventCategoryCollection,
    private _schedule: Schedule,
    private _location: Location | undefined,
    private _address: string,
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
    categoryIds?: string[];
    startDateTime: Date;
    endDateTime: Date;
    address: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    hostId: string;
  }): Event {
    const schedule = Schedule.create(params.startDateTime, params.endDateTime);
    const location =
      params.latitude != null && params.longitude != null
        ? Location.create(params.latitude, params.longitude)
        : undefined;

    // Create empty collection and register categories as NEW (not clean)
    // so they will be saved by the repository
    const categories = new EventCategoryCollection();
    for (const id of params.categoryIds || []) {
      categories.registerNew(EventCategory.create(id));
    }

    const cohosts = new EventCohostCollection();
    const attendees = new EventAttendeeCollection();

    return new Event(
      params.id,
      params.title,
      params.description,
      categories,
      schedule,
      location,
      params.address,
      params.capacity,
      params.hostId,
      cohosts,
      attendees,
      new Date(),
      new Date()
    );
  }

  static reconstitute(params: {
    id: string;
    title: string;
    description?: string;
    categories?: { id: string; name: string }[];
    startDateTime: Date;
    endDateTime: Date;
    address: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    hostId: string;
    host?: { id: string; name: string; avatarUrl?: string };
    cohosts: string[];
    attendees: { id: string; name: string; avatarUrl?: string }[];
    createdAt: Date;
    updatedAt: Date;
  }): Event {
    const schedule = Schedule.create(params.startDateTime, params.endDateTime);
    const location =
      params.latitude != null && params.longitude != null
        ? Location.create(params.latitude, params.longitude)
        : undefined;

    const categoryVOs = (params.categories || []).map((cat) =>
      EventCategory.create(cat.id, cat.name)
    );
    const categories = new EventCategoryCollection(categoryVOs);

    const cohostVOs = params.cohosts.map((userId) =>
      EventCohost.create(userId)
    );
    const attendeeVOs = params.attendees.map((attendee) =>
      EventAttendee.create(attendee.id, attendee.name, attendee.avatarUrl)
    );

    const cohosts = new EventCohostCollection(cohostVOs);
    const attendees = new EventAttendeeCollection(attendeeVOs);

    const event = new Event(
      params.id,
      params.title,
      params.description,
      categories,
      schedule,
      location,
      params.address,
      params.capacity,
      params.hostId,
      cohosts,
      attendees,
      params.createdAt,
      params.updatedAt
    );
    if (params.host) {
      event._host = params.host;
    }
    return event;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get categories(): EventCategory[] {
    return Array.from(this._categories);
  }

  get categoryIds(): string[] {
    return this.categories.map((c) => c.categoryId);
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

  get address(): string {
    return this._address;
  }

  get capacity(): number | undefined {
    return this._capacity;
  }

  get host(): { id: string; name: string; avatarUrl?: string } | undefined {
    return this._host;
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

  getCategoryChanges(): {
    new: EventCategory[];
    removed: EventCategory[];
  } {
    return {
      new: this._categories.getNew(),
      removed: this._categories.getRemoved(),
    };
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
    categoryIds?: string[];
    startDateTime?: Date;
    endDateTime?: Date;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    capacity?: number;
    cohostIds?: string[];
  }): void {
    if (params.title !== undefined) {
      this._title = params.title;
    }

    if (params.description !== undefined) {
      this._description = params.description;
    }

    if (params.categoryIds !== undefined) {
      this.updateCategories(params.categoryIds);
    }

    if (params.startDateTime && params.endDateTime) {
      this._schedule = Schedule.create(
        params.startDateTime,
        params.endDateTime
      );
    }

    if (params.address !== undefined) {
      this._address = params.address;
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

  private updateCategories(newCategoryIds: string[]): void {
    // const categoryVOs = newCategoryIds.map((id) => EventCategory.create(id));

    const currentIds = new Set(this.categoryIds);
    const newIdsSet = new Set(newCategoryIds);

    for (const existing of this.categories) {
      if (!newIdsSet.has(existing.categoryId)) {
        this._categories.registerRemoved(existing);
      }
    }

    for (const categoryId of newCategoryIds) {
      if (!currentIds.has(categoryId)) {
        this._categories.registerNew(EventCategory.create(categoryId));
      }
    }
  }

  private updateCohosts(newCohostIds: string[]): void {
    const cohostVOs = newCohostIds.map((id) => EventCohost.create(id));
    Event.validateCohosts(cohostVOs, this.hostId);

    const currentIds = new Set(this.cohosts.map((c) => c.userId));
    const newIdsSet = new Set(newCohostIds);

    for (const existing of this.cohosts) {
      if (!newIdsSet.has(existing.userId)) {
        this._cohosts.registerRemoved(existing);
      }
    }

    for (const userId of newCohostIds) {
      if (!currentIds.has(userId)) {
        this._cohosts.registerNew(EventCohost.create(userId));
      }
    }
  }

  addAttendee(userId: string): void {
    this.ensureNotHost(userId);
    this.ensureNotFull();
    this.ensureNotAlreadyAttending(userId);

    const attendee = EventAttendee.create(userId);
    this._attendees.registerNew(attendee);
  }

  removeAttendee(userId: string): void {
    this.ensureIsAttending(userId);

    const attendee = this.attendees.find((a) => a.userId === userId);
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

  private ensureNotFull(): void {
    if (this._capacity != null && this._attendees.count() >= this._capacity) {
      throw new Error("Event capacity is full.");
    }
  }

  private ensureNotAlreadyAttending(userId: string): void {
    const isAttending = Array.from(this._attendees).some(
      (a) => a.userId === userId
    );

    if (isAttending) {
      throw new Error("User is already attending this event.");
    }
  }

  private ensureIsAttending(userId: string): void {
    const isAttending = Array.from(this._attendees).some(
      (a) => a.userId === userId
    );
    if (!isAttending) {
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
