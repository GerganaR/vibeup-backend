import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user by Google ID
        const [user] = await User.findOrCreate({
          where: { googleId: profile.id },
          defaults: {
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// Optional: Passport session serialization
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});
