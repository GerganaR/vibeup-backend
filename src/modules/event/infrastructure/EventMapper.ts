import { EventAggregate } from "../domain/EventAggregate";
import { Event } from "../event.model";
import { EventAttendee } from "../eventAttendee.model";
import { EventCohost } from "../eventCohost.model";

export class EventMapper {
  static toDomain(eventModel: Event): EventAggregate {
    const attendees = (eventModel.attendees || []).map((a: EventAttendee) => ({
      userId: a.userId,
      eventId: a.eventId,
    }));

    const cohosts = (eventModel.cohosts || []).map((c: EventCohost) => ({
      userId: c.userId,
      eventId: c.eventId,
    }));

    return EventAggregate.reconstitute({
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

  static toPersistence(event: EventAggregate): Partial<Event> {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      categories: event.categories,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      latitude: event.latitude,
      longitude: event.longitude,
      capacity: event.capacity,
      hostId: event.hostId,
      updatedAt: new Date(),
    };
  }
}

