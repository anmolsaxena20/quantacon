import express from "express";
const router = express.Router();
import { getAiGuidance } from "../controllers/ai.controller.js";
router.post("/guidance", getAiGuidance);
export default router;
