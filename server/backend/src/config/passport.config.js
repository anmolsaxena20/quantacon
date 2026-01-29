import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: profile.emails[0].value,
            googleId: profile.id,
            picture: profile.photos?.[0]?.value,
            authProvider: "google",
            isVerified: true,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);
passport.use(
  "google-calendar",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/calendar/google/callback",
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.googleCalendarConnected = true;
          user.googleCalendarAccessToken = accessToken;
          user.googleCalendarRefreshToken = refreshToken;
          user.googleTokenExpiry = Date.now() + params.expires_in * 1000;
          await user.save();
          return done(null, user);
        }

        const email = profile.emails?.[0]?.value;
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          user.googleCalendarConnected = true;
          user.googleCalendarAccessToken = accessToken;
          user.googleCalendarRefreshToken = refreshToken;
          user.googleTokenExpiry = Date.now() + params.expires_in * 1000;
          await user.save();
          return done(null, user);
        }
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          picture: profile.photos?.[0]?.value,
          authProvider: "google",
          isVerified: true,
          googleCalendarConnected: true,
          googleCalendarAccessToken: accessToken,
          googleCalendarRefreshToken: refreshToken,
          googleTokenExpiry: Date.now() + params.expires_in * 1000,
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email:
              profile.emails?.[0]?.value || `${profile.username}@github.com`,
            githubId: profile.id,
            picture: profile.photos?.[0]?.value,
            authProvider: "github",
            isVerified: true,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

export default passport;
