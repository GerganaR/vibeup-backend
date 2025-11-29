import { eventRepository } from "./event.repository";
import { CreateEventDTO, UpdateEventDTO } from "./event.dto";
import { EventPolicy } from "./event.policy";
import { EventRules } from "./event.rules";

export class EventService {
  async getAllEvents() {
    return eventRepository.findAll();
  }

  async getEventById(id: string) {
    const event = await eventRepository.findById(id);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async createEvent(dto: CreateEventDTO, hostId: string) {
    EventRules.validateDates(dto.startDateTime, dto.endDateTime);

    if (dto.cohostIds) {
      EventRules.ensureNoDuplicateCohosts(dto.cohostIds);
      EventRules.ensureCohostNotHost(dto.cohostIds, hostId);
    }

    return eventRepository.createEvent({ ...dto, hostId }, dto.cohostIds || []);
  }

  async updateEvent(id: string, dto: UpdateEventDTO, userId: string) {
    const event = await this.getEventById(id);

    EventPolicy.ensureHost(event, userId);

    if (dto.startDateTime && dto.endDateTime) {
      EventRules.validateDates(dto.startDateTime, dto.endDateTime);
    }

    if (dto.cohostIds) {
      EventRules.ensureNoDuplicateCohosts(dto.cohostIds);
      EventRules.ensureCohostNotHost(dto.cohostIds, userId);
    }

    return eventRepository.updateEvent(id, dto, dto.cohostIds || []);
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.getEventById(id);

    EventPolicy.ensureHost(event, userId);

    return eventRepository.deleteEvent(id);
  }

  async rsvp(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);

    EventPolicy.ensureNotHost(event, userId);

    EventRules.ensureEventNotFull(event);
    EventRules.ensureNotAttending(event, userId);

    return eventRepository.addAttendee(eventId, userId);
  }

  async cancelRsvp(eventId: string, userId: string) {
    const event = await this.getEventById(eventId);

    EventRules.ensureIsAttending(event, userId);

    return eventRepository.removeAttendee(eventId, userId);
  }
}

export const eventService = new EventService();
