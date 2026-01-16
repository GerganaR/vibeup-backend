import { inject, injectable } from "inversify";
import { TYPES } from "@/core/di/types";
import { IEventRepository } from "../domain/repositories/IEventRepository";
import { Event } from "../domain/Event";

@injectable()
export class DashboardApplicationService {
  constructor(
    @inject(TYPES.IEventRepository) private eventRepository: IEventRepository
  ) {}

  async getStats(userId: string) {
    const [upcoming, attending, hosted] = await Promise.all([
      this.eventRepository.countUpcoming(),
      this.eventRepository.countAttending(userId),
      this.eventRepository.countHosted(userId),
    ]);

    return {
      upcomingCount: upcoming,
      attendingCount: attending,
      hostedCount: hosted,
    };
  }

  async getAttendingEvents(
    userId: string,
    categoryId?: string
  ): Promise<Event[]> {
    return this.eventRepository.findAttending(userId, categoryId);
  }

  async getHostedEvents(userId: string, categoryId?: string): Promise<Event[]> {
    return this.eventRepository.findHosted(userId, categoryId);
  }
}
