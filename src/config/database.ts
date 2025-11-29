import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User.model";
import { EventAttendee } from "@/models/EventAttendee.model";
import { EventCohost } from "@/models/EventCohost.model";
import { Event } from "@/models/Event.model";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [User, Event, EventAttendee, EventCohost],
  logging: false,
});
