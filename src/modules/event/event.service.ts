import { sequelize } from "@/core/config/database";
import { eventRepository } from "./event.repository";

import { CreateEventDTO, UpdateEventDTO } from "./event.dto";
import { EventRules } from "./event.rules";
import { EventPolicy } from "./event.policy";
import { NotFoundError } from "@/core/errors/httpErrors";

export class EventService {
  async getAllEvents() {
    return eventRepository.findAll();
  }

  async getEventById(id: string) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError("Event not found");
    return event;
  }

  async createEvent(dto: CreateEventDTO, hostId: string) {
    EventRules.validateDates(dto.startDateTime, dto.endDateTime);

    if (dto.cohostIds) {
      EventRules.ensureNoDuplicateCohosts(dto.cohostIds);
      EventRules.ensureCohostNotHost(dto.cohostIds, hostId);
    }

    return sequelize.transaction(async (t) => {
      const event = await eventRepository.insert(
        { ...dto, hostId },
        { transaction: t }
      );

      if (dto.cohostIds?.length) {
        await eventRepository.addCohosts(
          dto.cohostIds.map((c) => ({ eventId: event.id, userId: c })),
          { transaction: t }
        );
      }

      return event;
    });
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

    return sequelize.transaction(async (t) => {
      await eventRepository.updateById(id, dto, { transaction: t });

      await eventRepository.deleteCohosts(id, { transaction: t });

      if (dto.cohostIds?.length) {
        await eventRepository.addCohosts(
          dto.cohostIds.map((c) => ({ userId: c, eventId: id })),
          { transaction: t }
        );
      }

      return this.getEventById(id);
    });
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.getEventById(id);
    EventPolicy.ensureHost(event, userId);

    return sequelize.transaction(async (t) => {
      await eventRepository.deleteAttendeesByEvent(id, { transaction: t });
      await eventRepository.deleteCohosts(id, { transaction: t });
      return eventRepository.deleteById(id, { transaction: t });
    });
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
