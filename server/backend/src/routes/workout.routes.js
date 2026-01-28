import express from "express";
import {
  generateWorkout,
  completeWorkout,
} from "../controllers/workout.controller.js";
const router = express.Router();

router.post("/generate", generateWorkout);
router.post("/complete", completeWorkout);

export default router;
