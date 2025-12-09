import { Event } from "../domain/Event";
import { Event as EventModel } from "../event.model";
import { EventAttendee } from "../eventAttendee.model";
import { EventCohost } from "../eventCohost.model";

export class EventMapper {
  static toDomain(eventModel: EventModel): Event {
    const attendees = (eventModel.attendees || []).map((a: EventAttendee) => ({
      userId: a.userId,
      eventId: a.eventId,
    }));

    const cohosts = (eventModel.cohosts || []).map((c: EventCohost) => ({
      userId: c.userId,
      eventId: c.eventId,
    }));

    return Event.reconstitute({
      id: eventModel.id,
      title: eventModel.title,
      description: eventModel.description || undefined,
      categories: eventModel.categories || undefined,
      startDateTime: eventModel.startDateTime,
      endDateTime: eventModel.endDateTime,
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

  static toPersistence(event: Event): Partial<EventModel> {
    const data: Partial<EventModel> = {
      id: event.id,
      title: event.title,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      hostId: event.hostId,
      updatedAt: new Date(),
    };

    if (event.description !== undefined) {
      data.description = event.description;
    }
    if (event.categories !== undefined) {
      data.categories = event.categories;
    }
    if (event.latitude !== undefined) {
      data.latitude = event.latitude;
    }
    if (event.longitude !== undefined) {
      data.longitude = event.longitude;
    }
    if (event.capacity !== undefined) {
      data.capacity = event.capacity;
    }

    return data;
  }
}
