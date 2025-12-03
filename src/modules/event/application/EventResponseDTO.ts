import { EventAggregate } from "../domain/EventAggregate";

export interface EventResponseDTO {
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
}

export class EventResponseMapper {
  static toDTO(event: EventAggregate): EventResponseDTO {
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
      cohosts: event.cohosts.map((c) => ({
        userId: c.userId,
        eventId: c.eventId,
      })),
      attendees: event.attendees.map((a) => ({
        userId: a.userId,
        eventId: a.eventId,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static toDTOArray(events: EventAggregate[]): EventResponseDTO[] {
    return events.map((event) => this.toDTO(event));
  }
}

