import { IEventRepository } from "../domain/repositories/IEventRepository";
import { EventAggregate } from "../domain/EventAggregate";
import { Event } from "../event.model";
import { EventAttendee } from "../eventAttendee.model";
import { EventCohost } from "../eventCohost.model";
import { EventMapper } from "./EventMapper";
import { sequelize } from "@/core/config/database";
import { Transaction } from "sequelize";

export class EventRepository implements IEventRepository {
  async findById(id: string): Promise<EventAggregate | null> {
    const eventModel = await Event.findOne({
      where: { id },
      include: [
        {
          model: EventAttendee,
          as: "attendees",
        },
        {
          model: EventCohost,
          as: "cohosts",
        },
      ],
    });

    if (!eventModel) {
      return null;
    }

    return EventMapper.toDomain(eventModel);
  }

  async findAll(): Promise<EventAggregate[]> {
    const eventModels = await Event.findAll({
      include: [
        {
          model: EventAttendee,
          as: "attendees",
        },
        {
          model: EventCohost,
          as: "cohosts",
        },
      ],
      order: [["startDateTime", "ASC"]],
    });

    return eventModels.map((model) => EventMapper.toDomain(model));
  }

  async save(event: EventAggregate): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      const eventData = EventMapper.toPersistence(event);

      const [affectedRows] = await Event.update(eventData, {
        where: { id: event.id },
        transaction,
      });

      if (affectedRows === 0) {
        await Event.create(eventData, { transaction });
      }

      await this.syncCohosts(event, transaction);
      await this.syncAttendees(event, transaction);
    });
  }

  async delete(id: string): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      await EventAttendee.destroy({
        where: { eventId: id },
        transaction,
      });

      await EventCohost.destroy({
        where: { eventId: id },
        transaction,
      });

      await Event.destroy({
        where: { id },
        transaction,
      });
    });
  }

  private async syncCohosts(
    event: EventAggregate,
    transaction: Transaction
  ): Promise<void> {
    const changes = event.getCohostChanges();

    if (changes.new.length > 0) {
      await EventCohost.bulkCreate(
        changes.new.map((c) => ({
          eventId: c.eventId,
          userId: c.userId,
        })),
        { transaction }
      );
    }

    if (changes.removed.length > 0) {
      await EventCohost.destroy({
        where: {
          eventId: event.id,
          userId: changes.removed.map((c) => c.userId),
        },
        transaction,
      });
    }
  }

  private async syncAttendees(
    event: EventAggregate,
    transaction: Transaction
  ): Promise<void> {
    const changes = event.getAttendeeChanges();

    if (changes.new.length > 0) {
      await EventAttendee.bulkCreate(
        changes.new.map((a) => ({
          eventId: a.eventId,
          userId: a.userId,
        })),
        { transaction }
      );
    }

    if (changes.removed.length > 0) {
      await EventAttendee.destroy({
        where: {
          eventId: event.id,
          userId: changes.removed.map((a) => a.userId),
        },
        transaction,
      });
    }
  }
}
