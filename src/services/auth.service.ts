import { User } from "../models/User.model";
import jwt from "jsonwebtoken";

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

export class AuthService {
  static async googleLogin(accessToken: string) {
    try {
      // Method 1: Use access token to get user info from Google's userinfo API
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
      // Find or create user
      const [user] = await User.findOrCreate({
        where: { googleId: payload.id }, // Note: access token uses 'id' not 'sub'
        defaults: {
          email: payload.email,
          name: payload.name,
          avatarUrl: payload.picture,
        },
      });

      // Generate JWTs
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

      return { user, token, refreshToken };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to authenticate with Google"
      );
    }
  }

  static verifyJwt(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }
}
