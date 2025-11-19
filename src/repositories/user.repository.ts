import { User } from "../models/User.model";
import { BaseRepository } from "./base.repository";

/**
 * Repository layer for User model
 * Extends BaseRepository to inherit common CRUD operations
 * Contains user-specific query methods
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email } as any);
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.findOneBy({ googleId } as any);
  }

  /**
   * Find or create user by Google ID
   */
  async findOrCreateByGoogleId(
    googleId: string,
    userData: {
      email: string;
      name: string;
      avatarUrl?: string;
    }
  ): Promise<{ user: User; created: boolean }> {
    const result = await this.findOrCreate({
      where: { googleId } as any,
      defaults: {
        ...userData,
        googleId,
      },
    });

    return { user: result.entity, created: result.created };
  }

  /**
   * Find users by email domain
   * Example custom query method
   */
  async findByEmailDomain(domain: string): Promise<User[]> {
    return await this.findAll({
      where: {
        email: {
          [require("sequelize").Op.like]: `%@${domain}`,
        },
      } as any,
    });
  }

  /**
   * Find active users (example: could be based on last login, etc.)
   * This is just a placeholder for demonstration
   */
  async findActiveUsers(): Promise<User[]> {
    return await this.findAll({
      // Add your own criteria here
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    profileData: {
      name?: string;
      avatarUrl?: string;
    }
  ): Promise<User | null> {
    return await this.updateById(userId, profileData);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
