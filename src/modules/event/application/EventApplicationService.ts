import { Event } from "../domain/Event";
import { IEventRepository } from "../domain/repositories/IEventRepository";
import { NotFoundError } from "@/core/errors/httpErrors";
import { v4 as uuidv4 } from "uuid";
import { CreateEventDTO, UpdateEventDTO } from "../ui/event.dto";

export class EventApplicationService {
  constructor(private readonly eventRepository: IEventRepository) {}

  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    return event;
  }

  async createEvent(dto: CreateEventDTO, hostId: string): Promise<Event> {
    const event = Event.create({
      id: uuidv4(),
      title: dto.title,
      description: dto.description,
      categories: dto.categories,
      startDateTime: dto.startDateTime,
      endDateTime: dto.endDateTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      capacity: dto.capacity,
      hostId,
      // cohostIds: dto.cohostIds,
    });

    await this.eventRepository.save(event);
    return event;
  }

  async updateEvent(
    id: string,
    dto: UpdateEventDTO,
    userId: string
  ): Promise<Event> {
    const event = await this.getEventById(id);

    event.ensureHost(userId);

    event.update({
      title: dto.title,
      description: dto.description,
      categories: dto.categories,
      startDateTime: dto.startDateTime,
      endDateTime: dto.endDateTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      capacity: dto.capacity,
      cohostIds: dto.cohostIds,
    });

    await this.eventRepository.save(event);
    return event;
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await this.getEventById(id);

    event.ensureHost(userId);

    await this.eventRepository.delete(id);
  }

  async rsvp(eventId: string, userId: string): Promise<Event> {
    const event = await this.getEventById(eventId);

    event.addAttendee(userId);

    await this.eventRepository.save(event);
    return event;
  }

  async cancelRsvp(eventId: string, userId: string): Promise<Event> {
    const event = await this.getEventById(eventId);

    event.removeAttendee(userId);

    await this.eventRepository.save(event);
    return event;
  }
}
