import "express";

declare module "express" {
  interface Request {
    authenticatedGoogleUser?: {
      googleId: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    authenticatedUser?: import("../models/User.model").User;
  }
}
