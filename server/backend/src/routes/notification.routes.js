import express from "express";
const router = express.Router();
import { getPreviousNotifications } from "../controllers/notification.controller.js";
router.get("/previous-notifications", getPreviousNotifications);
export default router;
