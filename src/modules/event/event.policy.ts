import { Event } from "./event.model";

export const EventPolicy = {

  ensureHost(event: Event, userId: string) {
    if (event.hostId !== userId) {
      throw new Error("You are not the host of this event");
    }
  },

  ensureNotHost(event: Event, userId: string) {
    if (event.hostId === userId) {
      throw new Error("Hosts cannot perform this action");
    }
  },

};
