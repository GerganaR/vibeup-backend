import { Request, Response } from "express";
import { EventApplicationService } from "./application/EventApplicationService";
import { EventResponseMapper } from "./application/EventResponseDTO";
import { wrapController } from "@/core/utils/wrapController";

export class EventController {
  constructor(
    private readonly eventApplicationService: EventApplicationService
  ) {}

  async getAll(_req: Request, res: Response) {
    const events = await this.eventApplicationService.getAllEvents();
    res.json(EventResponseMapper.toDTOArray(events));
  }

  async getById(req: Request, res: Response) {
    const event = await this.eventApplicationService.getEventById(
      req.params.id
    );
    res.json(EventResponseMapper.toDTO(event));
  }

  async create(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await this.eventApplicationService.createEvent(
      req.body,
      user.id
    );
    res.status(201).json(EventResponseMapper.toDTO(event));
  }

  async update(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await this.eventApplicationService.updateEvent(
      req.params.id,
      req.body,
      user.id
    );
    res.json(EventResponseMapper.toDTO(event));
  }

  async delete(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    await this.eventApplicationService.deleteEvent(req.params.id, user.id);
    res.status(204).send();
  }

  async rsvp(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await this.eventApplicationService.rsvp(
      req.params.id,
      user.id
    );
    res.json(EventResponseMapper.toDTO(event));
  }

  async cancelRsvp(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await this.eventApplicationService.cancelRsvp(
      req.params.id,
      user.id
    );
    res.json(EventResponseMapper.toDTO(event));
  }
}

// Dependency injection setup
import { EventRepository } from "./infrastructure/EventRepository";
const eventRepository = new EventRepository();
const eventApplicationService = new EventApplicationService(eventRepository);
export const eventController = wrapController(
  new EventController(eventApplicationService)
);
