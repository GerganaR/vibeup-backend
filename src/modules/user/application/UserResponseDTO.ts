import { UserAggregate } from "../domain/UserAggregate";

export interface UserResponseDTO {
  id: string;
  googleId: string;
  name: string;
  avatarUrl?: string;
  email: string;
  locale?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseMapper {
  static toDTO(user: UserAggregate): UserResponseDTO {
    return {
      id: user.id,
      googleId: user.googleId,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

