import { QueryInterface } from "sequelize";

/**
 * Migration: Add database indexes for query optimization
 *
 * Note: Column names match Sequelize model definitions (camelCase)
 * since the models don't use underscored: true option
 */
export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    // User Identities - Index on googleId for OAuth lookups
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_user_identities_google_id 
      ON user_identities("googleId");
      `,
      { transaction },
    );

    // User Profiles - Index on email for lookups
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
      ON user_profiles(email);
      `,
      { transaction },
    );

    // Events - Composite index for dashboard queries (upcoming events by host)
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_events_host_start 
      ON events(host_id, start_datetime DESC);
      `,
      { transaction },
    );

    // Events - Index for location-based searches (if you query by lat/lng)
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_events_location 
      ON events(latitude, longitude) 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
      `,
      { transaction },
    );

    // Events - Index on end_datetime for filtering active/past events
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_events_end_datetime 
      ON events(end_datetime);
      `,
      { transaction },
    );

    // Event Attendees - Index for counting attendees per event
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id 
      ON event_attendees(event_id);
      `,
      { transaction },
    );

    // Event Cohosts - Index for finding all cohosts of an event
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_cohosts_event_id 
      ON event_cohosts(event_id);
      `,
      { transaction },
    );

    // Event Categories - Index for finding all events in a category
    await queryInterface.sequelize.query(
      `
      CREATE INDEX IF NOT EXISTS idx_event_categories_event_id 
      ON event_categories(event_id);
      `,
      { transaction },
    );

    await transaction.commit();
    console.log("✅ Indexes created successfully");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_user_identities_google_id;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_user_profiles_email;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_events_host_start;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_events_location;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_events_end_datetime;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_event_attendees_event_id;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_event_cohosts_event_id;`,
      { transaction },
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_event_categories_event_id;`,
      { transaction },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
