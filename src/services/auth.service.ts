import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { User } from "../models/User.model";

// Google userinfo API response type
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
  locale?: string;
}

interface AuthTokens {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Service layer for authentication
 * Handles business logic for auth operations
 */
export class AuthService {
  /**
   * Authenticate user with Google OAuth
   */
  async googleLogin(accessToken: string): Promise<AuthTokens> {
    try {
      // Fetch user info from Google
      const googleUser = await this.fetchGoogleUserInfo(accessToken);

      // Find or create user via repository
      const { user } = await userRepository.findOrCreateByGoogleId(
        googleUser.id,
        {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        }
      );

      // Generate JWT tokens for the user to be used in the frontend
      const tokens = this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to authenticate with Google"
      );
    }
  }

  /**
   * Fetch user information from Google's userinfo API
   */
  private async fetchGoogleUserInfo(
    accessToken: string
  ): Promise<GoogleUserInfo> {
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get user info from Google");
    }

    const payload = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!payload || !payload.id) {
      throw new Error("Invalid Google token");
    }

    return payload;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  generateTokens(user: User): { token: string; refreshToken: string } {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return { token, refreshToken };
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): any {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    const payload: any = this.verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await userRepository.findById(payload.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await userRepository.findById(userId);
  }
}

// Export singleton instance
export const authService = new AuthService();
