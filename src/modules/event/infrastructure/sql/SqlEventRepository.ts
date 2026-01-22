import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { Event } from "../../domain/Event";
import { sequelize } from "@/core/config/database";
import { QueryTypes } from "sequelize";
import { injectable } from "inversify";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  start_datetime: Date;
  end_datetime: Date;
  address: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  host_id: string;
  created_at: Date;
  updated_at: Date;
  // Aggregated JSON fields
  categories_json: string | null;
  attendees_json: string | null;
  cohosts_json: string | null;
  host_name: string | null;
  host_avatar: string | null;
}

@injectable()
export class SqlEventRepository implements IEventRepository {
  /**
   * Optimized findAll using a single query with JSON aggregation
   * This eliminates the N+1 problem by fetching all data in one round-trip
   */
  async findAll(): Promise<Event[]> {
    const query = `
      SELECT 
        e.*,
        -- Host info
        up.name as host_name,
        up."avatarUrl" as host_avatar,
        -- Categories as JSON array
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
           FROM event_categories ec
           JOIN categories c ON ec.category_id = c.id
           WHERE ec.event_id = e.id),
          '[]'
        ) as categories_json,
        -- Attendees as JSON array  
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ea.user_id, 
            'name', COALESCE(aup.name, 'Unknown'),
            'avatarUrl', aup."avatarUrl"
          ))
           FROM event_attendees ea
           LEFT JOIN user_profiles aup ON ea.user_id = aup.id
           WHERE ea.event_id = e.id),
          '[]'
        ) as attendees_json,
        -- Cohosts as JSON array
        COALESCE(
          (SELECT json_agg(ec.user_id)
           FROM event_cohosts ec
           WHERE ec.event_id = e.id),
          '[]'
        ) as cohosts_json
      FROM events e
      LEFT JOIN user_profiles up ON e.host_id = up.id
      ORDER BY e.start_datetime ASC
    `;

    const rows = await sequelize.query<EventRow>(query, {
      type: QueryTypes.SELECT,
    });

    return rows.map((row) => this.mapRowToEvent(row));
  }

  async findById(id: string): Promise<Event | null> {
    const query = `
      SELECT 
        e.*,
        -- Host info
        up.name as host_name,
        up."avatarUrl" as host_avatar,
        -- Categories as JSON array
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
           FROM event_categories ec
           JOIN categories c ON ec.category_id = c.id
           WHERE ec.event_id = e.id),
          '[]'
        ) as categories_json,
        -- Attendees as JSON array  
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ea.user_id, 
            'name', COALESCE(aup.name, 'Unknown'),
            'avatarUrl', aup."avatarUrl"
          ))
           FROM event_attendees ea
           LEFT JOIN user_profiles aup ON ea.user_id = aup.id
           WHERE ea.event_id = e.id),
          '[]'
        ) as attendees_json,
        -- Cohosts as JSON array
        COALESCE(
          (SELECT json_agg(ec.user_id)
           FROM event_cohosts ec
           WHERE ec.event_id = e.id),
          '[]'
        ) as cohosts_json
      FROM events e
      LEFT JOIN user_profiles up ON e.host_id = up.id
      WHERE e.id = $1
    `;

    const rows = await sequelize.query<EventRow>(query, {
      bind: [id],
      type: QueryTypes.SELECT,
    });

    if (rows.length === 0) return null;
    return this.mapRowToEvent(rows[0]);
  }

  async findAttending(userId: string, categoryId?: string): Promise<Event[]> {
    const hasCategoryFilter = categoryId && categoryId !== "All";

    const query = `
      SELECT 
        e.*,
        up.name as host_name,
        up."avatarUrl" as host_avatar,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
           FROM event_categories ec
           JOIN categories c ON ec.category_id = c.id
           WHERE ec.event_id = e.id),
          '[]'
        ) as categories_json,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ea2.user_id, 
            'name', COALESCE(aup.name, 'Unknown'),
            'avatarUrl', aup."avatarUrl"
          ))
           FROM event_attendees ea2
           LEFT JOIN user_profiles aup ON ea2.user_id = aup.id
           WHERE ea2.event_id = e.id),
          '[]'
        ) as attendees_json,
        COALESCE(
          (SELECT json_agg(ec2.user_id)
           FROM event_cohosts ec2
           WHERE ec2.event_id = e.id),
          '[]'
        ) as cohosts_json
      FROM events e
      JOIN event_attendees ea ON e.id = ea.event_id
      LEFT JOIN user_profiles up ON e.host_id = up.id
      ${hasCategoryFilter ? "JOIN event_categories ecat ON e.id = ecat.event_id" : ""}
      WHERE ea.user_id = $1 AND e.start_datetime > NOW()
      ${hasCategoryFilter ? "AND ecat.category_id = $2" : ""}
      ORDER BY e.start_datetime ASC
    `;

    const bind = hasCategoryFilter ? [userId, categoryId] : [userId];

    const rows = await sequelize.query<EventRow>(query, {
      bind,
      type: QueryTypes.SELECT,
    });

    return rows.map((row) => this.mapRowToEvent(row));
  }

  async findHosted(userId: string, categoryId?: string): Promise<Event[]> {
    const hasCategoryFilter = categoryId && categoryId !== "All";

    const query = `
      SELECT 
        e.*,
        up.name as host_name,
        up."avatarUrl" as host_avatar,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
           FROM event_categories ec
           JOIN categories c ON ec.category_id = c.id
           WHERE ec.event_id = e.id),
          '[]'
        ) as categories_json,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ea.user_id, 
            'name', COALESCE(aup.name, 'Unknown'),
            'avatarUrl', aup."avatarUrl"
          ))
           FROM event_attendees ea
           LEFT JOIN user_profiles aup ON ea.user_id = aup.id
           WHERE ea.event_id = e.id),
          '[]'
        ) as attendees_json,
        COALESCE(
          (SELECT json_agg(ec2.user_id)
           FROM event_cohosts ec2
           WHERE ec2.event_id = e.id),
          '[]'
        ) as cohosts_json
      FROM events e
      LEFT JOIN user_profiles up ON e.host_id = up.id
      ${hasCategoryFilter ? "JOIN event_categories ecat ON e.id = ecat.event_id" : ""}
      WHERE e.host_id = $1 AND e.start_datetime > NOW()
      ${hasCategoryFilter ? "AND ecat.category_id = $2" : ""}
      ORDER BY e.start_datetime ASC
    `;

    const bind = hasCategoryFilter ? [userId, categoryId] : [userId];

    const rows = await sequelize.query<EventRow>(query, {
      bind,
      type: QueryTypes.SELECT,
    });

    return rows.map((row) => this.mapRowToEvent(row));
  }

  /**
   * Maps a database row with JSON aggregated fields to an Event domain object
   */
  private mapRowToEvent(row: EventRow): Event {
    const categories =
      typeof row.categories_json === "string"
        ? JSON.parse(row.categories_json || "[]")
        : row.categories_json || [];

    const attendees =
      typeof row.attendees_json === "string"
        ? JSON.parse(row.attendees_json || "[]")
        : row.attendees_json || [];

    const cohosts =
      typeof row.cohosts_json === "string"
        ? JSON.parse(row.cohosts_json || "[]")
        : row.cohosts_json || [];

    return Event.reconstitute({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      categories: categories.filter((c: any) => c !== null),
      startDateTime: row.start_datetime,
      endDateTime: row.end_datetime,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
      capacity: row.capacity ?? undefined,
      hostId: row.host_id,
      host: row.host_name
        ? {
            id: row.host_id,
            name: row.host_name,
            avatarUrl: row.host_avatar ?? undefined,
          }
        : undefined,
      attendees: attendees.filter((a: any) => a !== null),
      cohosts: cohosts.filter((c: any) => c !== null),
      address: row.address,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
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
}
