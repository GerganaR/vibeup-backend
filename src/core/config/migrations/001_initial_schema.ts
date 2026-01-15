import { QueryInterface } from "sequelize";

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    // Categories
    await queryInterface.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `,
      { transaction }
    );

    // Events
    await queryInterface.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_datetime TIMESTAMP NOT NULL,
        end_datetime   TIMESTAMP NOT NULL,
        address TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        capacity INTEGER,
        host_id UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_events_host_id 
      ON events(host_id);
    `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_events_start_datetime
      ON events(start_datetime);
    `,
      { transaction }
    );

    // Event Attendees
    await queryInterface.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS event_attendees (
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id  UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (event_id, user_id)
      );
    `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id
      ON event_attendees(user_id);
    `,
      { transaction }
    );

    // Event Cohosts
    await queryInterface.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS event_cohosts (
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id  UUID NOT NULL REFERENCES user_identities(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (event_id, user_id)
      );
    `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_cohosts_user_id
      ON event_cohosts(user_id);
    `,
      { transaction }
    );

    // Event Categories
    await queryInterface.sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS event_categories (
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (event_id, category_id)
      );
    `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_categories_category_id
      ON event_categories(category_id);
    `,
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.dropTable("event_categories", { transaction });
    await queryInterface.dropTable("event_cohosts", { transaction });
    await queryInterface.dropTable("event_attendees", { transaction });
    await queryInterface.dropTable("events", { transaction });
    await queryInterface.dropTable("categories", { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
