import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { Event } from "../../domain/Event";
import { EventModel } from "./models/EventModel";
import { EventAttendeeModel } from "./models/EventAttendeeModel";
import { EventCohostModel } from "./models/EventCohostModel";
import { EventMapper } from "./EventMapper";
import { sequelize } from "@/core/config/database";
import { Transaction } from "sequelize";
import { UserIdentity } from "@/modules/user/user.entity";
import { UserProfile } from "@/modules/user/userProfile.entity";

/**
 * EventRepository - Infrastructure implementation of IEventRepository
 *
 */
export class EventRepository implements IEventRepository {
  /**
   * Finds an Event by ID and reconstitutes it as a domain aggregate
   *
   * @param id - Event identifier
   * @returns Domain Event aggregate or null if not found
   */
  async findById(id: string): Promise<Event | null> {
    const eventModel = await EventModel.findOne({
      where: { id },
      include: [
        {
          model: EventAttendeeModel,
          as: "attendees",
          include: [
            {
              model: UserIdentity,
              as: "user",
              include: [{ model: UserProfile, as: "profile" }],
            },
          ],
        },
        {
          model: EventCohostModel,
          as: "cohosts",
        },
      ],
    });

    if (!eventModel) {
      return null;
    }

    return EventMapper.toDomain(eventModel);
  }

  /**
   * Finds all Events and reconstitutes them as domain aggregates
   *
   * @returns Array of domain Event aggregates
   */
  async findAll(): Promise<Event[]> {
    const eventModels = await EventModel.findAll({
      include: [
        {
          model: EventAttendeeModel,
          as: "attendees",
          include: [
            {
              model: UserIdentity,
              as: "user",
              include: [{ model: UserProfile, as: "profile" }],
            },
          ],
        },
        {
          model: EventCohostModel,
          as: "cohosts",
        },
      ],
      order: [["startDateTime", "ASC"]],
    });

    return eventModels.map((model) => EventMapper.toDomain(model));
  }

  /**
   * Saves an Event aggregate to persistence
   *
   * This method:
   * 1. Maps the domain aggregate to persistence format
   * 2. Creates or updates the event record
   * 3. Synchronizes cohosts and attendees based on tracked changes
   *
   * All operations are performed within a transaction to ensure atomicity.
   *
   * @param event - Domain Event aggregate to persist
   */
  async save(event: Event): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      const eventData = EventMapper.toPersistence(event);
      const existingEvent = await EventModel.findByPk(event.id, {
        transaction,
      });

      if (existingEvent) {
        await EventModel.update(eventData, {
          where: { id: event.id },
          transaction,
        });
      } else {
        await EventModel.create(eventData, { transaction });
      }

      await this.syncCohosts(event, transaction);
      await this.syncAttendees(event, transaction);
    });
  }

  /**
   * Deletes an Event and all related records
   *
   * @param id - Event identifier
   */
  async delete(id: string): Promise<void> {
    await sequelize.transaction(async (transaction: Transaction) => {
      await EventAttendeeModel.destroy({
        where: { eventId: id },
        transaction,
      });

      await EventCohostModel.destroy({
        where: { eventId: id },
        transaction,
      });

      await EventModel.destroy({
        where: { id },
        transaction,
      });
    });
  }

  /**
   * Synchronizes cohosts based on tracked changes in the domain aggregate
   *
   * Uses the EventCohostCollection's change tracking to determine
   * which cohosts to add and which to remove.
   *
   * @param event - Domain Event aggregate
   * @param transaction - Sequelize transaction
   */
  private async syncCohosts(
    event: Event,
    transaction: Transaction
  ): Promise<void> {
    const changes = event.getCohostChanges();

    if (changes.new.length > 0) {
      await EventCohostModel.bulkCreate(
        changes.new.map((c) => ({
          userId: c.userId,
        })),
        { transaction }
      );
    }

    if (changes.removed.length > 0) {
      await EventCohostModel.destroy({
        where: {
          eventId: event.id,
          userId: changes.removed.map((c) => c.userId),
        },
        transaction,
      });
    }
  }

  /**
   * Synchronizes attendees based on tracked changes in the domain aggregate
   *
   * Uses the EventAttendeeCollection's change tracking to determine
   * which attendees to add and which to remove.
   *
   * @param event - Domain Event aggregate
   * @param transaction - Sequelize transaction
   */
  private async syncAttendees(
    event: Event,
    transaction: Transaction
  ): Promise<void> {
    const changes = event.getAttendeeChanges();

    if (changes.new.length > 0) {
      await EventAttendeeModel.bulkCreate(
        changes.new.map((a) => ({
          userId: a.userId,
        })),
        { transaction }
      );
    }

    if (changes.removed.length > 0) {
      await EventAttendeeModel.destroy({
        where: {
          eventId: event.id,
          userId: changes.removed.map((a) => a.userId),
        },
        transaction,
      });
    }
  }

  async countUpcoming(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  async countAttending(userId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  async countHosted(userId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  async findAttending(userId: string, category?: string): Promise<Event[]> {
    throw new Error("Method not implemented.");
  }
  async findHosted(userId: string, category?: string): Promise<Event[]> {
    throw new Error("Method not implemented.");
  }
}
