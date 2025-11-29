import { Request, Response } from "express";
import { eventService } from "./event.service";
import { wrapController } from "@/core/utils/wrapController";

export class EventController {
  async getAll(_req: Request, res: Response) {
    res.json(await eventService.getAllEvents());
  }


  async getById(req: Request, res: Response) {
    res.json(await eventService.getEventById(req.params.id));
  }

  async create(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await eventService.createEvent(req.body, user.id);
    res.status(201).json(event);
  }

  async update(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    const event = await eventService.updateEvent(
      req.params.id,
      req.body,
      user.id
    );
    res.json(event);
  }

  async delete(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    await eventService.deleteEvent(req.params.id, user.id);
    res.status(204).send();
  }

  async rsvp(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    res.json(await eventService.rsvp(req.params.id, user.id));
  }

  async cancelRsvp(req: Request, res: Response) {
    const user = req.authenticatedUser!;
    res.json(await eventService.cancelRsvp(req.params.id, user.id));
  }
}

export const eventController = wrapController(new EventController());
