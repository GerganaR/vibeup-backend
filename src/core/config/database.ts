import { Sequelize } from "sequelize-typescript";
import { UserProfile } from "@/modules/user/userProfile.entity";
import { UserIdentity } from "@/modules/user/userIdentity.entity";

// Legacy Event Models - Migrated to Raw SQL
// import { EventModel } from "@/modules/event/infrastructure/models/EventModel";
// import { EventAttendeeModel } from "@/modules/event/infrastructure/models/EventAttendeeModel";
// import { EventCohostModel } from "@/modules/event/infrastructure/models/EventCohostModel";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
});
