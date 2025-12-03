import { UserAggregate } from "../UserAggregate";

export interface IUserRepository {
  findById(id: string): Promise<UserAggregate | null>;
  findByGoogleId(googleId: string): Promise<UserAggregate | null>;
  save(user: UserAggregate): Promise<void>;
}

