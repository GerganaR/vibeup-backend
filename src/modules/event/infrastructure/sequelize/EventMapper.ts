import { Event } from "../../domain/Event";
import {
  EventAttendeeModel,
  EventCohostModel,
  EventCategoryModel,
  EventModel,
} from "./models";

export class EventMapper {
  /**
   * Maps a Sequelize model to a domain Event aggregate
   *
   * This method reconstitutes the domain aggregate from persistence,
   * including all value objects (Schedule, Location) and collections
   * (EventCohostCollection, EventAttendeeCollection).
   *
   * @param eventModel - Sequelize model instance with loaded associations
   * @returns Domain Event aggregate
   */
  static toDomain(eventModel: EventModel): Event {
    const attendees = (eventModel.attendees || []).map(
      (a: EventAttendeeModel) => a.userId
    );

    const cohosts = (eventModel.cohosts || []).map(
      (c: EventCohostModel) => c.userId
    );

    const categories = (eventModel.categories || []).map(
      (c: EventCategoryModel) => ({
        id: c.categoryId,
        name: c.category?.name || "",
      })
    );

    return Event.reconstitute({
      id: eventModel.id,
      title: eventModel.title,
      description: eventModel.description || undefined,
      categories: categories.length > 0 ? categories : undefined,
      startDateTime: eventModel.startDateTime,
      endDateTime: eventModel.endDateTime,
      address: eventModel.address,
      latitude: eventModel.latitude || undefined,
      longitude: eventModel.longitude || undefined,
      capacity: eventModel.capacity || undefined,
      hostId: eventModel.hostId,
      cohosts,
      attendees,
      createdAt: eventModel.createdAt,
      updatedAt: eventModel.updatedAt,
    });
  }

  /**
   * Maps a domain Event aggregate to persistence data
   *
   * This method extracts only the primitive data needed for persistence.
   * Collections (cohosts, attendees) are handled separately by the repository
   * to track additions and removals.
   *
   * @param event - Domain Event aggregate
   * @returns Plain object suitable for Sequelize create/update
   */
  static toPersistence(event: Event): {
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
    updatedAt: Date;
  } {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      categoryIds: event.categoryIds,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      capacity: event.capacity,
      hostId: event.hostId,
      updatedAt: new Date(),
    };
  }
}
