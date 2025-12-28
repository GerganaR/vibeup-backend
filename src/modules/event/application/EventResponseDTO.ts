import { Event } from "../domain/Event";

export interface EventResponseDTO {
  id: string;
  title: string;
  description?: string;
  categories?: string[];
  startDateTime: Date;
  endDateTime: Date;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  hostId: string;
  cohosts: string[];
  attendees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class EventResponseMapper {
  static toDTO(event: Event): EventResponseDTO {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      categories: event.categories,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      capacity: event.capacity,
      hostId: event.hostId,
      attendees: event.attendees.map((a) => a.userId),
      cohosts: event.cohosts.map((c) => c.userId),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static toDTOArray(events: Event[]): EventResponseDTO[] {
    return events.map((event) => this.toDTO(event));
  }
}
