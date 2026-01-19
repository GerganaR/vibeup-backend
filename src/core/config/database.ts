import { Sequelize } from "sequelize-typescript";
import { UserProfile } from "@/modules/user/infrastructure/models/UserProfile.model";
import { UserIdentity } from "@/modules/user/infrastructure/models/UserIdentity.model";

// Legacy Event Models - Migrated to Raw SQL
// import { EventModel } from "@/modules/event/infrastructure/models/EventModel";
// import { EventAttendeeModel } from "@/modules/event/infrastructure/models/EventAttendeeModel";
// import { EventCohostModel } from "@/modules/event/infrastructure/models/EventCohostModel";

// Neon DB Connection (DATABASE_URL required)
export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  models: [
    UserIdentity,
    UserProfile,
    // New Event Models - Raw SQL
    // Legacy Event Models
    // EventModel,
    // EventAttendeeModel,
    // EventCohostModel,
  ],
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Local DB (Legacy - commented out)
// export const sequelize = new Sequelize({
//   dialect: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT || 5432),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   models: [
//     UserIdentity,
//     UserProfile,
//   ],
//   logging: false,
// });
