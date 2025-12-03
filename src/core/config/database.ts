import { Sequelize } from "sequelize-typescript";
import { EventAttendee } from "@/modules/event/eventAttendee.model";
import { EventCohost } from "@/modules/event/eventCohost.model";
import { Event } from "@/modules/event/event.model";
import { UserProfile } from "@/modules/user/userProfile.entity";
import { UserIdentity } from "@/modules/user/userIdentity.entity";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [UserIdentity, UserProfile, Event, EventAttendee, EventCohost],
  logging: false,
});
