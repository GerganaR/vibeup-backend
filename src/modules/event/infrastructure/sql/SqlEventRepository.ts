import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { Event } from "../../domain/Event";
import { sequelize } from "@/core/config/database";
import { QueryTypes } from "sequelize";

export class SqlEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    const rows = await sequelize.query(
      `SELECT * FROM events WHERE id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    if (rows.length === 0) return null;
    const e: any = rows[0];

    const attendeeRows = await sequelize.query(
      `SELECT user_id FROM event_attendees WHERE event_id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    const cohostRows = await sequelize.query(
      `SELECT user_id FROM event_cohosts WHERE event_id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    return Event.reconstitute({
      id: e.id,
      title: e.title,
      description: e.description,
      categories: e.categories,
      startDateTime: e.start_datetime,
      endDateTime: e.end_datetime,
      latitude: e.latitude,
      longitude: e.longitude,
      capacity: e.capacity,
      hostId: e.host_id,
      attendees: (attendeeRows as any[]).map((r) => r.user_id),
      cohosts: (cohostRows as any[]).map((r) => r.user_id),
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    });
  }

  async findAll(): Promise<Event[]> {
    const ids = await sequelize.query(
      `SELECT id FROM events ORDER BY start_datetime ASC`,
      { type: QueryTypes.SELECT }
    );

    const events: Event[] = [];
    for (const row of ids as any[]) {
      const event = await this.findById(row.id);
      if (event) events.push(event);
    }
    return events;
  }

  async save(event: Event): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const data = {
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
      };

      await sequelize.query(
        `
        INSERT INTO events (
          id, title, description, categories, start_datetime, end_datetime,
          latitude, longitude, capacity, host_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          categories = EXCLUDED.categories,
          start_datetime = EXCLUDED.start_datetime,
          end_datetime = EXCLUDED.end_datetime,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          capacity = EXCLUDED.capacity,
          updated_at = now()
        `,
        {
          bind: [
            data.id,
            data.title,
            data.description,
            data.categories,
            data.startDateTime,
            data.endDateTime,
            data.latitude,
            data.longitude,
            data.capacity,
            data.hostId,
          ],
          transaction: t,
        }
      );

      // Attendees
      const attendeeChanges = event.getAttendeeChanges();
      for (const a of attendeeChanges.new) {
        await sequelize.query(
          `INSERT INTO event_attendees (event_id, user_id) VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          { bind: [event.id, a.userId], transaction: t }
        );
      }
      if (attendeeChanges.removed.length > 0) {
        await sequelize.query(
          `DELETE FROM event_attendees 
           WHERE event_id = $1 AND user_id = ANY($2)`,
          {
            bind: [event.id, attendeeChanges.removed.map((a) => a.userId)],
            transaction: t,
          }
        );
      }

      // Cohosts
      const cohostChanges = event.getCohostChanges();
      for (const c of cohostChanges.new) {
        await sequelize.query(
          `INSERT INTO event_cohosts (event_id, user_id) VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          { bind: [event.id, c.userId], transaction: t }
        );
      }
      if (cohostChanges.removed.length > 0) {
        await sequelize.query(
          `DELETE FROM event_cohosts 
           WHERE event_id = $1 AND user_id = ANY($2)`,
          {
            bind: [event.id, cohostChanges.removed.map((c) => c.userId)],
            transaction: t,
          }
        );
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    await sequelize.query(`DELETE FROM event_attendees WHERE event_id = $1`, {
      bind: [id],
    });
    await sequelize.query(`DELETE FROM event_cohosts WHERE event_id = $1`, {
      bind: [id],
    });
    await sequelize.query(`DELETE FROM events WHERE id = $1`, {
      bind: [id],
    });
  }
}
