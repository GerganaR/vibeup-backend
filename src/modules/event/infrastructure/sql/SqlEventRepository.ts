import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { Event } from "../../domain/Event";
import { sequelize } from "@/core/config/database";
import { QueryTypes } from "sequelize";
import { injectable } from "inversify";

@injectable()
export class SqlEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    const rows = await sequelize.query(`SELECT * FROM events WHERE id = $1`, {
      bind: [id],
      type: QueryTypes.SELECT,
    });

    if (rows.length === 0) return null;
    const e: any = rows[0];

    const categoryRows = await sequelize.query(
      `SELECT c.id, c.name FROM event_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE ec.event_id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    const attendeeRows = await sequelize.query(
      `SELECT ea.user_id, up.name, up."avatarUrl" 
       FROM event_attendees ea
       LEFT JOIN user_profiles up ON ea.user_id = up.id
       WHERE ea.event_id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    const cohostRows = await sequelize.query(
      `SELECT user_id FROM event_cohosts WHERE event_id = $1`,
      { bind: [id], type: QueryTypes.SELECT }
    );

    // Fetch host user info
    const hostRows = await sequelize.query(
      `SELECT id, name, "avatarUrl" FROM user_profiles WHERE id = $1`,
      { bind: [e.host_id], type: QueryTypes.SELECT }
    );
    const hostInfo = hostRows.length > 0 ? (hostRows[0] as any) : null;

    // Build event object as before
    const event = Event.reconstitute({
      id: e.id,
      title: e.title,
      description: e.description,
      categories: (categoryRows as any[]).map((r) => ({
        id: r.id,
        name: r.name,
      })),
      startDateTime: e.start_datetime,
      endDateTime: e.end_datetime,
      latitude: e.latitude,
      longitude: e.longitude,
      capacity: e.capacity,
      hostId: e.host_id,
      host: hostInfo
        ? {
            id: hostInfo.id,
            name: hostInfo.name || "Unknown",
            avatarUrl: hostInfo.avatarUrl,
          }
        : undefined,
      attendees: (attendeeRows as any[]).map((r) => ({
        id: r.user_id,
        name: r.name || "Unknown",
        avatarUrl: r.avatarUrl,
      })),
      cohosts: (cohostRows as any[]).map((r) => r.user_id),
      address: e.address,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    });
    return event;
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
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
        capacity: event.capacity ?? null,
        hostId: event.hostId,
      };

      await sequelize.query(
        `
        INSERT INTO events (
          id, title, description, start_datetime, end_datetime,
          latitude, longitude, capacity, host_id, address 
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          start_datetime = EXCLUDED.start_datetime,
          end_datetime = EXCLUDED.end_datetime,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          capacity = EXCLUDED.capacity,
          address = EXCLUDED.address,
          updated_at = now()
        `,
        {
          bind: [
            data.id,
            data.title,
            data.description,
            data.startDateTime,
            data.endDateTime,
            data.latitude,
            data.longitude,
            data.capacity,
            data.hostId,
            data.address,
          ],
          transaction: t,
        }
      );

      // Categories
      const categoryChanges = event.getCategoryChanges();
      for (const c of categoryChanges.new) {
        await sequelize.query(
          `INSERT INTO event_categories (event_id, category_id) VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          { bind: [event.id, c.categoryId], transaction: t }
        );
      }
      if (categoryChanges.removed.length > 0) {
        await sequelize.query(
          `DELETE FROM event_categories 
           WHERE event_id = $1 AND category_id = ANY($2)`,
          {
            bind: [event.id, categoryChanges.removed.map((c) => c.categoryId)],
            transaction: t,
          }
        );
      }

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

  async countUpcoming(): Promise<number> {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM events WHERE start_datetime > NOW()`,
      { type: QueryTypes.SELECT }
    );
    return parseInt((result[0] as any).count, 10);
  }

  async countAttending(userId: string): Promise<number> {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count 
       FROM events e
       JOIN event_attendees ea ON e.id = ea.event_id
       WHERE ea.user_id = $1 AND e.start_datetime > NOW()`,
      { bind: [userId], type: QueryTypes.SELECT }
    );
    return parseInt((result[0] as any).count, 10);
  }

  async countHosted(userId: string): Promise<number> {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count 
       FROM events e
       WHERE host_id = $1 AND e.start_datetime > NOW()`,
      { bind: [userId], type: QueryTypes.SELECT }
    );
    return parseInt((result[0] as any).count, 10);
  }

  async findAttending(userId: string, categoryId?: string): Promise<Event[]> {
    let query = `
      SELECT e.id 
      FROM events e
      JOIN event_attendees ea ON e.id = ea.event_id
      ${
        categoryId && categoryId !== "All"
          ? "JOIN event_categories ec ON e.id = ec.event_id"
          : ""
      }
      WHERE ea.user_id = $1 AND e.start_datetime > NOW()
      ${categoryId && categoryId !== "All" ? "AND ec.category_id = $2" : ""}
      ORDER BY e.start_datetime ASC
    `;

    const bind = [userId];
    if (categoryId && categoryId !== "All") bind.push(categoryId);

    const ids = await sequelize.query(query, { bind, type: QueryTypes.SELECT });

    const events: Event[] = [];
    for (const row of ids as any[]) {
      const event = await this.findById(row.id);
      if (event) events.push(event);
    }
    return events;
  }

  async findHosted(userId: string, categoryId?: string): Promise<Event[]> {
    let query = `
      SELECT e.id 
      FROM events e
      ${
        categoryId && categoryId !== "All"
          ? "JOIN event_categories ec ON e.id = ec.event_id"
          : ""
      }
      WHERE e.host_id = $1 AND e.start_datetime > NOW()
      ${categoryId && categoryId !== "All" ? "AND ec.category_id = $2" : ""}
      ORDER BY e.start_datetime ASC
    `;

    const bind = [userId];
    if (categoryId && categoryId !== "All") bind.push(categoryId);

    const ids = await sequelize.query(query, { bind, type: QueryTypes.SELECT });

    const events: Event[] = [];
    for (const row of ids as any[]) {
      const event = await this.findById(row.id);
      if (event) events.push(event);
    }
    return events;
  }
}
