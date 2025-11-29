// import { Transaction } from "sequelize";
// import { Event } from "../models/Event.model";
// import { EventAttendee } from "../models/EventAttendee.model";
// import { EventCohost } from "../models/EventCohost.model";
// import { BaseRepository } from "./base.repository";

// export class EventRepository extends BaseRepository<Event> {
//   constructor() {
//     super(Event);
//   }

//   /**
//    * Create event with cohosts in a transaction
//    * All operations must succeed or all will be rolled back
//    */
//   async createEventWithCohosts(
//     eventData: {
//       title: string;
//       description?: string;
//       categories?: string[];
//       startDateTime: Date;
//       endDateTime: Date;
//       latitude?: number;
//       longitude?: number;
//       capacity?: number;
//       hostId: string;
//     },
//     cohostIds: string[] = []
//   ): Promise<Event> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.create(eventData, { transaction: t });

//       if (cohostIds.length > 0) {
//         await EventCohost.bulkCreate(
//           cohostIds.map((userId) => ({ eventId: event.id, userId })),
//           { transaction: t }
//         );
//       }

//       return event;
//     });
//   }

//   /**
//    * Delete event and all related records in a transaction
//    * Deletes EventAttendee and EventCohost records before deleting the event
//    */
//   async deleteEvent(eventId: string): Promise<boolean> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.findByPk(eventId, { transaction: t });
//       if (!event) return false;

//       // Delete all attendees
//       await EventAttendee.destroy({
//         where: { eventId },
//         transaction: t,
//       });

//       // Delete all cohosts
//       await EventCohost.destroy({
//         where: { eventId },
//         transaction: t,
//       });

//       // Delete the event
//       await event.destroy({ transaction: t });

//       return true;
//     });
//   }

//   /**
//    * RSVP to event with capacity check in a transaction
//    * Prevents race conditions when multiple users RSVP simultaneously
//    */
//   async rsvpToEvent(
//     eventId: string,
//     userId: string
//   ): Promise<{ success: boolean; message?: string }> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.findByPk(eventId, { transaction: t });
//       if (!event) {
//         return { success: false, message: "Event not found" };
//       }

//       // Check if user is already attending
//       const existingAttendee = await EventAttendee.findOne({
//         where: { eventId, userId },
//         transaction: t,
//       });

//       if (existingAttendee) {
//         return { success: false, message: "Already RSVPed to this event" };
//       }

//       // Check capacity if event has a limit
//       if (event.capacity) {
//         const currentAttendeeCount = await EventAttendee.count({
//           where: { eventId },
//           transaction: t,
//         });

//         if (currentAttendeeCount >= event.capacity) {
//           return { success: false, message: "Event is at full capacity" };
//         }
//       }

//       // Create attendee record
//       await EventAttendee.create({ eventId, userId }, { transaction: t });

//       return { success: true };
//     });
//   }

//   /**
//    * Cancel RSVP (remove attendee) in a transaction
//    */
//   async cancelRsvp(eventId: string, userId: string): Promise<boolean> {
//     return await this.transaction(async (t: Transaction) => {
//       const deletedCount = await EventAttendee.destroy({
//         where: { eventId, userId },
//         transaction: t,
//       });

//       return deletedCount > 0;
//     });
//   }

//   /**
//    * Add multiple attendees in a transaction
//    * All attendees must be added or none will be added
//    */
//   async addMultipleAttendees(
//     eventId: string,
//     userIds: string[]
//   ): Promise<{ added: number; skipped: number }> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.findByPk(eventId, { transaction: t });
//       if (!event) {
//         throw new Error("Event not found");
//       }

//       let added = 0;
//       let skipped = 0;

//       for (const userId of userIds) {
//         // Check if already attending
//         const existing = await EventAttendee.findOne({
//           where: { eventId, userId },
//           transaction: t,
//         });

//         if (existing) {
//           skipped++;
//           continue;
//         }

//         // Check capacity if event has a limit
//         if (event.capacity) {
//           const currentCount = await EventAttendee.count({
//             where: { eventId },
//             transaction: t,
//           });

//           if (currentCount >= event.capacity) {
//             skipped++;
//             continue;
//           }
//         }

//         await EventAttendee.create({ eventId, userId }, { transaction: t });
//         added++;
//       }

//       return { added, skipped };
//     });
//   }

//   /**
//    * Add multiple cohosts in a transaction
//    * All cohosts must be added or none will be added
//    */
//   async addMultipleCohosts(
//     eventId: string,
//     userIds: string[]
//   ): Promise<{ added: number; skipped: number }> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.findByPk(eventId, { transaction: t });
//       if (!event) {
//         throw new Error("Event not found");
//       }

//       let added = 0;
//       let skipped = 0;

//       for (const userId of userIds) {
//         // Check if already a cohost
//         const existing = await EventCohost.findOne({
//           where: { eventId, userId },
//           transaction: t,
//         });

//         if (existing) {
//           skipped++;
//           continue;
//         }

//         // Don't allow adding the host as a cohost
//         if (event.hostId === userId) {
//           skipped++;
//           continue;
//         }

//         await EventCohost.create({ eventId, userId }, { transaction: t });
//         added++;
//       }

//       return { added, skipped };
//     });
//   }

//   /**
//    * Remove multiple attendees in a transaction
//    */
//   async removeMultipleAttendees(
//     eventId: string,
//     userIds: string[]
//   ): Promise<number> {
//     return await this.transaction(async (t: Transaction) => {
//       const deletedCount = await EventAttendee.destroy({
//         where: {
//           eventId,
//           userId: userIds,
//         },
//         transaction: t,
//       });

//       return deletedCount;
//     });
//   }

//   /**
//    * Remove multiple cohosts in a transaction
//    */
//   async removeMultipleCohosts(
//     eventId: string,
//     userIds: string[]
//   ): Promise<number> {
//     return await this.transaction(async (t: Transaction) => {
//       const deletedCount = await EventCohost.destroy({
//         where: {
//           eventId,
//           userId: userIds,
//         },
//         transaction: t,
//       });

//       return deletedCount;
//     });
//   }

//   /**
//    * Transfer event ownership in a transaction
//    * Updates hostId and optionally manages cohost records
//    */
//   async transferEventOwnership(
//     eventId: string,
//     newHostId: string,
//     options?: {
//       removeOldHostFromCohosts?: boolean;
//       addNewHostAsCohost?: boolean;
//     }
//   ): Promise<Event | null> {
//     return await this.transaction(async (t: Transaction) => {
//       const event = await Event.findByPk(eventId, { transaction: t });
//       if (!event) return null;

//       const oldHostId = event.hostId;

//       // Update host
//       await event.update({ hostId: newHostId }, { transaction: t });

//       // Remove old host from cohosts if requested
//       if (options?.removeOldHostFromCohosts) {
//         await EventCohost.destroy({
//           where: { eventId, userId: oldHostId },
//           transaction: t,
//         });
//       }

//       // Add new host as cohost if requested (optional, usually not needed)
//       if (options?.addNewHostAsCohost) {
//         const existing = await EventCohost.findOne({
//           where: { eventId, userId: newHostId },
//           transaction: t,
//         });

//         if (!existing) {
//           await EventCohost.create(
//             { eventId, userId: newHostId },
//             { transaction: t }
//           );
//         }
//       }

//       return event.reload({ transaction: t });
//     });
//   }

//   /**
//    * Get event with all attendees
//    * Returns event and separate array of attendee records
//    */
//   async findEventWithAttendees(
//     eventId: string
//   ): Promise<{ event: Event | null; attendees: EventAttendee[] }> {
//     const event = await Event.findByPk(eventId);
//     if (!event) {
//       return { event: null, attendees: [] };
//     }

//     const attendees = await EventAttendee.findAll({
//       where: { eventId },
//     });

//     return { event, attendees };
//   }

//   /**
//    * Get event with all cohosts
//    * Returns event and separate array of cohost records
//    */
//   async findEventWithCohosts(
//     eventId: string
//   ): Promise<{ event: Event | null; cohosts: EventCohost[] }> {
//     const event = await Event.findByPk(eventId);
//     if (!event) {
//       return { event: null, cohosts: [] };
//     }

//     const cohosts = await EventCohost.findAll({
//       where: { eventId },
//     });

//     return { event, cohosts };
//   }

//   /**
//    * Get event with attendees and cohosts
//    * Returns event and separate arrays of attendee and cohost records
//    */
//   async findEventWithRelations(eventId: string): Promise<{
//     event: Event | null;
//     attendees: EventAttendee[];
//     cohosts: EventCohost[];
//   }> {
//     const event = await Event.findByPk(eventId);
//     if (!event) {
//       return { event: null, attendees: [], cohosts: [] };
//     }

//     const [attendees, cohosts] = await Promise.all([
//       EventAttendee.findAll({ where: { eventId } }),
//       EventCohost.findAll({ where: { eventId } }),
//     ]);

//     return { event, attendees, cohosts };
//   }

//   /**
//    * Get events by host
//    */
//   async findEventsByHost(hostId: string): Promise<Event[]> {
//     return await this.findBy({ hostId } as any);
//   }

//   /**
//    * Get events where user is a cohost
//    */
//   async findEventsByCohost(userId: string): Promise<Event[]> {
//     const cohostRecords = await EventCohost.findAll({
//       where: { userId },
//     });

//     const eventIds = cohostRecords.map((record) => record.eventId);

//     if (eventIds.length === 0) return [];

//     return await Event.findAll({
//       where: {
//         id: eventIds,
//       } as any,
//     });
//   }

//   /**
//    * Get events where user is attending
//    */
//   async findEventsByAttendee(userId: string): Promise<Event[]> {
//     const attendeeRecords = await EventAttendee.findAll({
//       where: { userId },
//     });

//     const eventIds = attendeeRecords.map((record) => record.eventId);

//     if (eventIds.length === 0) return [];

//     return await Event.findAll({
//       where: {
//         id: eventIds,
//       } as any,
//     });
//   }

//   /**
//    * Get attendee count for an event
//    */
//   async getAttendeeCount(eventId: string): Promise<number> {
//     return await EventAttendee.count({
//       where: { eventId },
//     });
//   }

//   /**
//    * Get cohost count for an event
//    */
//   async getCohostCount(eventId: string): Promise<number> {
//     return await EventCohost.count({
//       where: { eventId },
//     });
//   }

//   /**
//    * Check if user is attending an event
//    */
//   async isUserAttending(eventId: string, userId: string): Promise<boolean> {
//     const count = await EventAttendee.count({
//       where: { eventId, userId },
//     });
//     return count > 0;
//   }

//   /**
//    * Check if user is a cohost of an event
//    */
//   async isUserCohost(eventId: string, userId: string): Promise<boolean> {
//     const count = await EventCohost.count({
//       where: { eventId, userId },
//     });
//     return count > 0;
//   }

//   /**
//    * Check if user is the host of an event
//    */
//   async isUserHost(eventId: string, userId: string): Promise<boolean> {
//     const event = await Event.findByPk(eventId);
//     return event?.hostId === userId;
//   }
// }

// // Export singleton instance
// export const eventRepository = new EventRepository();
