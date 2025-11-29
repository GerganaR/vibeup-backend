export interface IEventController {
  // GET methods
  getAllEvents(req: Request, res: Response): Promise<void>;
  getEventById(req: Request, res: Response): Promise<void>;
  getMyEvents(req: Request, res: Response): Promise<void>;
  getMyAttendingEvents(req: Request, res: Response): Promise<void>;
  getMyCohostingEvents(req: Request, res: Response): Promise<void>;

  // POST methods
  createEvent(req: Request, res: Response): Promise<void>;
  rsvpToEvent(req: Request, res: Response): Promise<void>;

  // PUT methods
  updateEvent(req: Request, res: Response): Promise<void>;

  // DELETE methods
  deleteEvent(req: Request, res: Response): Promise<void>;
  cancelRsvp(req: Request, res: Response): Promise<void>;
}
