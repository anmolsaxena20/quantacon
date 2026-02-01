import express from "express";
const router = express.Router();
import {
  getAiGuidance,
  getAiMotivation,
} from "../controllers/ai.controller.js";
router.post("/guidance", getAiGuidance);
router.post("/motivate", getAiMotivation);
export default router;
