import { sequelize } from "./database";

export async function initEventTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      categories TEXT[],
      start_datetime TIMESTAMP NOT NULL,
      end_datetime   TIMESTAMP NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      capacity INTEGER,
      host_id UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_events_host_id 
    ON events(host_id);
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_events_start_datetime
    ON events(start_datetime);
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id  UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, user_id)
    );
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id
    ON event_attendees(user_id);
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS event_cohosts (
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id  UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, user_id)
    );
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_event_cohosts_user_id
    ON event_cohosts(user_id);
  `);

  console.log("✓ Event tables ensured");
}
