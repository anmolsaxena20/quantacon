import express from "express";
import passport from "../config/passport.config.js";
import { oauthCalendarSuccess } from "../controllers/workout.controller.js";
const router = express.Router();
router.get(
  "/google",
  passport.authenticate("google-calendar", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    accessType: "offline",
    prompt: "consent",
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google-calendar", {
    session: false,
    failureRedirect: "/calendar/google/failure",
  }),
  oauthCalendarSuccess,
);
export default router;
