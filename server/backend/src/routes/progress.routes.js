import express from "express";
import { getProgressStats } from "../controllers/progress.controller.js";
const router = express.Router();
router.get("/stats", getProgressStats); 
export default router;
