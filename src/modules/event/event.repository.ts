import { sequelize } from "@/core/config/database";
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

  async createEvent(data: Partial<Event>, cohosts: string[]) {
    return sequelize.transaction(async (t) => {
      const event = await Event.create(data, { transaction: t });

      if (cohosts.length > 0) {
        await EventCohost.bulkCreate(
          cohosts.map((c) => ({ userId: c, eventId: event.id })),
          { transaction: t }
        );
      }
      return event;
    });
  }

  async updateEvent(id: string, data: Partial<Event>, cohosts: string[]) {
    return sequelize.transaction(async (t) => {
      await Event.update(data, { where: { id }, transaction: t });

      await EventCohost.destroy({ where: { eventId: id }, transaction: t });

      if (cohosts.length) {
        await EventCohost.bulkCreate(
          cohosts.map((c) => ({ userId: c, eventId: id })),
          { transaction: t }
        );
      }

      return this.findById(id);
    });
  }

  async deleteEvent(id: string) {
    return sequelize.transaction(async (t) => {
      await EventAttendee.destroy({ where: { eventId: id }, transaction: t });
      await EventCohost.destroy({ where: { eventId: id }, transaction: t });
      return Event.destroy({ where: { id }, transaction: t });
    });
  }

  async addAttendee(eventId: string, userId: string) {
    return EventAttendee.create({ eventId, userId });
  }

  async removeAttendee(eventId: string, userId: string) {
    return EventAttendee.destroy({ where: { eventId, userId } });
  }
}

export const eventRepository = new EventRepository();
