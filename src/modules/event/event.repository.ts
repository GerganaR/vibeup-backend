import { Event } from "./event.model";
import { EventAttendee } from "./eventAttendee.model";
import { EventCohost } from "./eventCohost.model";

export class EventRepository {
  async findAll() {
    return Event.findAll({
      include: [EventAttendee, EventCohost],
      order: [["startDateTime", "ASC"]],
    });
  }

  async findById(id: string) {
    return Event.findOne({
      where: { id },
      include: [EventAttendee, EventCohost],
    });
  }

  async insert(data: Partial<Event>, options = {}) {
    return Event.create(data, options);
  }

  async updateById(id: string, data: Partial<Event>, options = {}) {
    return Event.update(data, { where: { id }, ...options });
  }

  async deleteById(id: string, options = {}) {
    return Event.destroy({ where: { id }, ...options });
  }

  // COHOSTS
  async deleteCohosts(eventId: string, options = {}) {
    return EventCohost.destroy({
      where: { eventId },
      ...options,
    });
  }

  async addCohosts(rows: { userId: string; eventId: string }[], options = {}) {
    return EventCohost.bulkCreate(rows, options);
  }

  // ATTENDEES
  async addAttendee(eventId: string, userId: string, options = {}) {
    return EventAttendee.create({ eventId, userId }, options);
  }

  async removeAttendee(eventId: string, userId: string, options = {}) {
    return EventAttendee.destroy({
      where: { eventId, userId },
      ...options,
    });
  }

  async deleteAttendeesByEvent(eventId: string, options = {}) {
    return EventAttendee.destroy({
      where: { eventId },
      ...options,
    });
  }
}

export const eventRepository = new EventRepository();
