import express from "express";
import { generateAiWorkout } from "../controllers/ai.controller.js";
const router = express.Router();
router.post("/generate", generateAiWorkout);
export default router;
