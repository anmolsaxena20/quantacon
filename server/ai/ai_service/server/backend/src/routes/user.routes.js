import express from "express";
import { logout, getUserDetails } from "../controllers/user.controller.js";
const router = express.Router();
router.post("/logout", logout);
router.get("/me", getUserDetails);
export default router;
