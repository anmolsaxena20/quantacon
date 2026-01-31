import express from "express";
import {
  generateWorkout,
  completeWorkout,
  createWorkoutAlarm,
  getWorkoutDaysOfMonth,
  getWorkoutsOfDay,
} from "../controllers/workout.controller.js";

const router = express.Router();

router.post("/generate", generateWorkout);
router.post("/complete", completeWorkout);
router.post("/calendar/create", createWorkoutAlarm);
router.get("/month/details", getWorkoutDaysOfMonth);
router.get("/day/details", getWorkoutsOfDay);
export default router;
