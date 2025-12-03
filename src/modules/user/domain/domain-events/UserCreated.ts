import { DomainEvent } from "@/core/domain/DomainEvent";

export class UserCreated extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly googleId: string
  ) {
    super(userId);
  }

  getEventType(): string {
    return "UserCreated";
  }
}

