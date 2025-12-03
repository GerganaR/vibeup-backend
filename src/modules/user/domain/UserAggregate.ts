import { Email } from "./value-objects/Email";
import { UserCreated } from "./domain-events/UserCreated";
import { DomainEvent } from "@/core/domain/DomainEvent";

export class UserAggregate {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly googleId: string,
    private _name: string,
    private _avatarUrl: string | undefined,
    private _email: Email,
    private _locale: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: {
    id: string;
    googleId: string;
    name?: string;
    avatarUrl?: string;
    email: string;
    locale?: string;
  }): UserAggregate {
    const email = Email.create(params.email);
    const user = new UserAggregate(
      params.id,
      params.googleId,
      params.name || "",
      params.avatarUrl,
      email,
      params.locale,
      new Date(),
      new Date()
    );

    user.addDomainEvent(new UserCreated(user.id, user.googleId));

    return user;
  }

  static reconstitute(params: {
    id: string;
    googleId: string;
    name: string;
    avatarUrl?: string;
    email: string;
    locale?: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserAggregate {
    const email = Email.create(params.email);

    return new UserAggregate(
      params.id,
      params.googleId,
      params.name,
      params.avatarUrl,
      email,
      params.locale,
      params.createdAt,
      params.updatedAt
    );
  }

  get name(): string {
    return this._name;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get email(): string {
    return this._email.value;
  }

  get locale(): string | undefined {
    return this._locale;
  }

  updateProfile(params: {
    name?: string;
    avatarUrl?: string;
    email?: string;
    locale?: string;
  }): void {
    if (params.name !== undefined) {
      this._name = params.name;
    }

    if (params.avatarUrl !== undefined) {
      this._avatarUrl = params.avatarUrl;
    }

    if (params.email !== undefined) {
      this._email = Email.create(params.email);
    }

    if (params.locale !== undefined) {
      this._locale = params.locale;
    }
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}

