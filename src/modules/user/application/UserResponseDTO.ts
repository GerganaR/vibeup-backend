import { UserAggregate } from "../domain/UserAggregate";

export interface UserResponseDTO {
  id: string;
  profile: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseMapper {
  static toDTO(user: UserAggregate): UserResponseDTO {
    return {
      id: user.id,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}