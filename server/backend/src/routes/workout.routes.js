import express from "express";
import {
  generateWorkout,
  completeWorkout,
  oauthCalendarSuccess,
  createWorkoutAlarm,
} from "../controllers/workout.controller.js";
import passport from "../config/passport.config.js";
const router = express.Router();

router.post("/generate", generateWorkout);
router.post("/complete", completeWorkout);
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
    failureRedirect: "/workout/google/failure",
  }),
  oauthCalendarSuccess,
);
router.post("/calendar/create", createWorkoutAlarm);
export default router;
