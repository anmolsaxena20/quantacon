import express from "express";
import {
  generateWorkout,
  completeWorkout,
  oauthCalendarSuccess,
  createWorkoutAlarm,
} from "../controllers/workout.controller.js";

const router = express.Router();

router.post("/generate", generateWorkout);
router.post("/complete", completeWorkout);
router.post("/calendar/create", createWorkoutAlarm);
export default router;
