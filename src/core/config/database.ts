import { Sequelize } from "sequelize-typescript";
import { EventAttendee } from "@/modules/event/eventAttendee.model";
import { EventCohost } from "@/modules/event/eventCohost.model";
import { Event } from "@/modules/event/event.model";
import { UserEntity } from "@/modules/user/user.entity";
import { UserProfile } from "@/modules/user/userProfile.entity";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [UserEntity, UserProfile, Event, EventAttendee, EventCohost],
  logging: false,
});
