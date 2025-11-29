import { OAuth2Client } from "google-auth-library";
import { GoogleAuthenticatedUser } from "./auth.types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {

  async verifyIdToken(idToken: string): Promise<GoogleAuthenticatedUser> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub) throw new Error("Invalid Google token");

    return {
      googleId: payload.sub,
      name: payload.name ?? "",
      picture: payload.picture ?? "",
      email: payload.email ?? "",
      locale: payload.locale ?? "",
    };
  }
}

export const googleAuthService = new GoogleAuthService();
